/*
# Rate limit and de-duplicate public review submissions

1. Changes
  - Adds a unique index preventing the exact same author + content being submitted
    more than once as a real (non-placeholder) review.
  - Adds a BEFORE INSERT trigger that rejects a submission when more than 5 real
    reviews have already been created in the preceding 60 seconds.

2. Security
  - The reviews form is public by design (the storefront has no sign-in), so there
    is no identity to throttle against. A short global time window bounds automated
    flooding without blocking a genuine customer writing a review.
  - Enforced in the database, so it applies to direct Data API calls and not only to
    the storefront's own form.

3. Notes
  - Existing rows are untouched; the index is created only over non-placeholder rows
    so seeded sample reviews are unaffected.
  - The limit is deliberately generous for normal use: a real shopper submits one
    review, not six within a minute.
*/

CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_real_submission
  ON reviews (author, content)
  WHERE is_placeholder = false;

CREATE OR REPLACE FUNCTION enforce_review_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM reviews
  WHERE is_placeholder = false
    AND created_at > now() - interval '60 seconds';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many reviews submitted recently. Please try again shortly.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION enforce_review_rate_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS reviews_rate_limit ON reviews;
CREATE TRIGGER reviews_rate_limit
  BEFORE INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION enforce_review_rate_limit();

/*
# Harden public review submissions

1. Constraints
  - `author` 1–60 chars, `content` 1–2000 chars, `product_name` 0–120 chars.
    Prevents unbounded text being pushed through the public data API.

2. Security
  - Replaces the `WITH CHECK (true)` INSERT policy with one that enforces the same
    bounds and forces `is_placeholder = false`, so a submitted review can never
    claim the seeded/"verified" presentation.
  - Revokes UPDATE and DELETE table privileges from anon and authenticated,
    matching the original migration's stated intent.

3. Notes
  - SELECT stays public: this is an intentionally public storefront.
  - Existing rows are within the new bounds (verified before applying).
*/

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_author_len;
ALTER TABLE reviews ADD CONSTRAINT reviews_author_len
  CHECK (char_length(author) BETWEEN 1 AND 60);

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_content_len;
ALTER TABLE reviews ADD CONSTRAINT reviews_content_len
  CHECK (char_length(content) BETWEEN 1 AND 2000);

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_product_name_len;
ALTER TABLE reviews ADD CONSTRAINT reviews_product_name_len
  CHECK (char_length(product_name) <= 120);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    is_placeholder = false
    AND rating BETWEEN 1 AND 5
    AND char_length(btrim(author)) BETWEEN 1 AND 60
    AND char_length(btrim(content)) BETWEEN 1 AND 2000
    AND char_length(product_name) <= 120
  );

REVOKE UPDATE, DELETE ON reviews FROM anon, authenticated;

/*
# Create reviews table for Flux storefront

1. New Tables
  - `reviews`
    - `id` (uuid, primary key)
    - `author` (text) – display name submitted by reviewer
    - `rating` (integer, 1–5)
    - `content` (text) – review body
    - `product_name` (text) – which product was reviewed
    - `is_placeholder` (boolean, default true) – true = seeded filler, false = real user review
    - `created_at` (timestamptz)

2. Security
  - RLS enabled; anon + authenticated roles can SELECT and INSERT.
  - No UPDATE/DELETE allowed from the client.

3. Notes
  - No auth required – this is a public storefront.
  - Placeholder reviews have is_placeholder = true; real reviews set it to false.
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content text NOT NULL,
  product_name text NOT NULL DEFAULT '',
  is_placeholder boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

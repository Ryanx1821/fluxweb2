/*
# Create a server-only secrets table

1. New Tables
  - `server_secrets`
    - `name` (text, primary key) – identifier for the secret, e.g. 'SELLAUTH_API_KEY'
    - `value` (text, not null) – the secret value
    - `updated_at` (timestamptz)

2. Security
  - Row level security is ENABLED and NO policies are created. With RLS on and no
    policy, every request from the browser (anon or authenticated) matches nothing
    and reads nothing. This is deliberate deny-by-default.
  - All privileges are additionally REVOKED from anon and authenticated, so the
    table is not reachable through the Data API at all.
  - Only the service role, which bypasses RLS and is available exclusively to
    server-side edge functions, can read this table.

3. Notes
  - This exists so the SellAuth merchant API key is not committed to source code.
    The storefront's edge function reads it here using the service role key.
  - Nothing in the browser bundle can ever see these values.
*/

CREATE TABLE IF NOT EXISTS server_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE server_secrets ENABLE ROW LEVEL SECURITY;

-- Deny by default: no policies are defined, so no client role can read or write.
REVOKE ALL ON server_secrets FROM anon, authenticated;

/*
  # Create users table with authentication fields

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `roles` (text array)
      - `verification_token` (text)
      - `is_email_verified` (boolean)
      - `failed_attempts` (integer)
      - `refresh_token` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read their own data
    - Add policy for user registration
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  roles text[] DEFAULT ARRAY['user'],
  verification_token text,
  is_email_verified boolean DEFAULT false,
  failed_attempts integer DEFAULT 0,
  refresh_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to increment failed attempts
CREATE OR REPLACE FUNCTION increment_failed_attempts(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET 
    failed_attempts = failed_attempts + 1,
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
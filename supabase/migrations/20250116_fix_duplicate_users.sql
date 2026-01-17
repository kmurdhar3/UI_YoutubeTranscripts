-- Fix duplicate users in the users table
-- This migration removes duplicates and adds proper constraints

-- Step 1: Create a temporary table with unique users
-- We prioritize by: most recent created_at, then prefer entries with more data
CREATE TEMP TABLE unique_users AS
WITH ranked_users AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(user_id, id::text) 
      ORDER BY 
        created_at DESC,
        CASE WHEN email IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN name IS NOT NULL OR full_name IS NOT NULL THEN 1 ELSE 0 END DESC
    ) as rn
  FROM public.users
)
SELECT 
  id, avatar_url, user_id, token_identifier, subscription, 
  credits, image, created_at, updated_at, email, name, full_name
FROM ranked_users
WHERE rn = 1;

-- Step 2: Backup the original table (in case we need to revert)
CREATE TABLE IF NOT EXISTS public.users_backup_20250116 AS
SELECT * FROM public.users;

-- Step 3: Delete all users from the original table
DELETE FROM public.users;

-- Step 4: Insert back only the unique users
INSERT INTO public.users
SELECT * FROM unique_users;

-- Step 5: Drop the temp table
DROP TABLE unique_users;

-- Step 6: Add unique constraint on user_id (if not already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_user_id_unique'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Note: We're not adding a unique constraint on email because users might not have email initially
-- and NULL values can cause issues with unique constraints

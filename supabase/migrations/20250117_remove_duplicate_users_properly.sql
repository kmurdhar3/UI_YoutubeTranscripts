-- Remove duplicate users properly by keeping only one entry per unique user_id
-- This migration handles the case where duplicates still exist

-- Step 1: First, let's identify all duplicates and keep only the most recent
WITH duplicates AS (
  SELECT id, user_id, email, created_at,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(LOWER(email), user_id::text)
      ORDER BY created_at DESC NULLS LAST
    ) as row_num
  FROM public.users
  WHERE email IS NOT NULL OR user_id IS NOT NULL
)
DELETE FROM public.users
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Step 2: Also remove any orphaned entries without email AND without user_id
DELETE FROM public.users
WHERE email IS NULL AND user_id IS NULL;

-- Step 3: Create unique index on email to prevent future duplicates
DROP INDEX IF EXISTS idx_users_email_unique;
CREATE UNIQUE INDEX idx_users_email_unique ON public.users(LOWER(email)) WHERE email IS NOT NULL;

-- Step 4: Ensure user_id constraint exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_user_id_unique'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_user_id_unique UNIQUE (user_id);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

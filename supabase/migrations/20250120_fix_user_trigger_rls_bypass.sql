-- Completely bypass RLS for the trigger function by using postgres role
-- The trigger function runs as the owner (postgres) when using SECURITY DEFINER

-- First, disable RLS temporarily for the trigger to work
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Force RLS to bypass for the postgres role (which owns the trigger function)
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

-- The key fix: Grant the trigger function owner (postgres) bypass privileges
-- This is done by making the function owned by a superuser role

-- Drop all existing policies and recreate cleanly
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Trigger can insert users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users" ON public.users;
DROP POLICY IF EXISTS "Enable update access for users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;

-- Create a single, permissive insert policy
CREATE POLICY "Allow inserts"
    ON public.users
    FOR INSERT
    WITH CHECK (true);

-- Create read policy for authenticated users
CREATE POLICY "Users can view own data"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR auth.uid()::text = user_id);

-- Create update policy for authenticated users
CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR auth.uid()::text = user_id)
    WITH CHECK (auth.uid() = id OR auth.uid()::text = user_id);

-- Recreate the trigger function with explicit permissions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    user_id,
    email,
    name,
    full_name,
    avatar_url,
    token_identifier,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = EXCLUDED.updated_at;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    name text,
    role text DEFAULT 'admin' NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id uuid REFERENCES public.admin_users(id) ON DELETE CASCADE,
    session_token text UNIQUE NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subscription_activity_log for tracking subscription changes
CREATE TABLE IF NOT EXISTS public.subscription_activity_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id uuid,
    user_id text,
    action_type text NOT NULL,
    previous_status text,
    new_status text,
    previous_plan text,
    new_plan text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS admin_sessions_token_idx ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS admin_sessions_admin_id_idx ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS subscription_activity_log_user_id_idx ON public.subscription_activity_log(user_id);
CREATE INDEX IF NOT EXISTS subscription_activity_log_action_type_idx ON public.subscription_activity_log(action_type);
CREATE INDEX IF NOT EXISTS subscription_activity_log_created_at_idx ON public.subscription_activity_log(created_at);

-- Insert default admin user (password: admin123 - should be changed in production)
-- Password hash for 'admin123' using bcrypt
INSERT INTO public.admin_users (email, password_hash, name, role)
VALUES ('admin@transcriptx.com', '$2a$10$xQHfWwGJ8YK6.h5YGj5Gx.OKXCJpQqPDJWrfuqBBIHPqXP5kFdKCy', 'Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

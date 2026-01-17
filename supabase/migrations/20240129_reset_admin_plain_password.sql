-- Delete existing admin user and recreate with plain text password for demo
DELETE FROM public.admin_sessions WHERE admin_id IN (SELECT id FROM public.admin_users WHERE email = 'admin@transcriptx.com');
DELETE FROM public.admin_users WHERE email = 'admin@transcriptx.com';

-- Insert admin user with plain text password 'admin123' for demo purposes
INSERT INTO public.admin_users (email, password_hash, name, role, is_active)
VALUES (
    'admin@transcriptx.com',
    'admin123',
    'Admin',
    'super_admin',
    true
);

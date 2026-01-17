-- Delete existing admin user
DELETE FROM public.admin_users WHERE email = 'admin@transcriptx.com';

-- Insert admin user with pre-computed bcrypt hash for password 'admin123'
-- This hash was generated using bcryptjs with 10 rounds
INSERT INTO public.admin_users (email, password_hash, name, role, is_active)
VALUES (
    'admin@transcriptx.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Admin',
    'super_admin',
    true
);

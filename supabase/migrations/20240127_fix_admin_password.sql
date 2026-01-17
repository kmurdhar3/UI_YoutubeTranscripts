-- Fix admin password hash (password: admin123)
-- Generated with bcrypt, 10 rounds
UPDATE public.admin_users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'admin@transcriptx.com';

-- If no rows updated, insert the admin user
INSERT INTO public.admin_users (email, password_hash, name, role)
SELECT 'admin@transcriptx.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM public.admin_users WHERE email = 'admin@transcriptx.com');

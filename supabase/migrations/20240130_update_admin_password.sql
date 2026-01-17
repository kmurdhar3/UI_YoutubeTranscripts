-- Update existing admin user with plain text password 'admin123' for demo purposes
UPDATE public.admin_users 
SET password_hash = 'admin123'
WHERE email = 'admin@transcriptx.com';

-- Create user_subscriptions table for managing subscription plans and quotas
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    plan text DEFAULT 'free' NOT NULL,
    quota integer DEFAULT 25 NOT NULL,
    used_quota integer DEFAULT 0 NOT NULL,
    quota_reset_date timestamp with time zone DEFAULT (now() + interval '1 month'),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_api_tokens table for API authentication
CREATE TABLE IF NOT EXISTS public.user_api_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    token text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used_at timestamp with time zone
);

-- Add indexes
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_api_tokens_user_id_idx ON public.user_api_tokens(user_id);
CREATE INDEX IF NOT EXISTS user_api_tokens_token_idx ON public.user_api_tokens(token);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription"
    ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
    ON public.user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own API tokens"
    ON public.user_api_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API tokens"
    ON public.user_api_tokens
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API tokens"
    ON public.user_api_tokens
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, quota, used_quota)
  VALUES (NEW.id, 'free', 25, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create subscription when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

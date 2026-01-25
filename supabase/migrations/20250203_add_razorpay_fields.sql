-- Add Razorpay specific columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS razorpay_subscription_id text,
ADD COLUMN IF NOT EXISTS amount numeric,
ADD COLUMN IF NOT EXISTS payment_method text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_order 
ON public.subscriptions(razorpay_order_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_payment 
ON public.subscriptions(razorpay_payment_id);

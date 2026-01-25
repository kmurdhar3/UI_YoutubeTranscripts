import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const signature = req.headers.get('x-razorpay-signature');
    
    const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    
    if (!RAZORPAY_WEBHOOK_SECRET) {
      throw new Error('Razorpay webhook secret not configured');
    }

    // Verify webhook signature
    const crypto = await import('node:crypto');
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const event = body.event;
    const payload = body.payload.payment.entity;

    switch (event) {
      case 'payment.captured':
        // Payment successful - create/update subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: payload.notes.userId,
            razorpay_payment_id: payload.id,
            razorpay_order_id: payload.order_id,
            status: 'active',
            amount: payload.amount / 100,
            currency: payload.currency,
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
          })
          .select()
          .single();

        if (subError) {
          console.error('Error creating subscription:', subError);
          throw subError;
        }

        // Update user quota
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: payload.notes.userId,
            plan: 'pro',
            quota: 1000,
            used_quota: 0,
            quota_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

        break;

      case 'payment.failed':
        // Handle failed payment
        console.log('Payment failed:', payload.id);
        break;

      case 'subscription.cancelled':
        // Handle subscription cancellation
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancel_at_period_end: true,
          })
          .eq('razorpay_order_id', payload.id);
        break;

      default:
        console.log('Unhandled event:', event);
    }

    return new Response(
      JSON.stringify({ status: 'success' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

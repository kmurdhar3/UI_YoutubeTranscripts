import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight - must return 200 status with 'ok' body
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json();
    const { amount, currency, priceId, userId } = body;

    console.log('Received request body:', JSON.stringify(body));

    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    console.log('RAZORPAY_KEY_ID exists:', !!RAZORPAY_KEY_ID);
    console.log('RAZORPAY_KEY_SECRET exists:', !!RAZORPAY_KEY_SECRET);

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }

    if (!amount || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}. Amount must be greater than 0.`);
    }

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const amountInPaise = Math.round(amount * 100); // Ensure integer value
    
    console.log('Creating order with amount in paise:', amountInPaise);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          priceId: priceId || 'default',
          userId: userId || 'anonymous',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay API error:', JSON.stringify(errorData));
      throw new Error(errorData.error?.description || `Razorpay API error: ${response.status}`);
    }

    const order = await response.json();

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'If you see "Razorpay credentials not configured", please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your Supabase Edge Function secrets in the Supabase Dashboard.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

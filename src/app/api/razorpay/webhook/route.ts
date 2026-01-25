import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-razorpay-signature');
    
    // Forward to Supabase edge function for processing
    const supabase = await createClient();
    
    const { data, error } = await supabase.functions.invoke('supabase-functions-razorpay-webhook', {
      body: body,
      headers: {
        'x-razorpay-signature': signature || '',
      }
    });

    if (error) {
      console.error('Webhook processing error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

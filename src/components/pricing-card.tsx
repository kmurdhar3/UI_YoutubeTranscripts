"use client";

import { supabase } from "../../supabase/supabase";
import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { User } from "@supabase/supabase-js";
import { Check } from "lucide-react";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingCard({ item, user }: {
    item: any,
    user: User | null
}) {
  const [loading, setLoading] = useState(false);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle checkout process with Razorpay
  const handleCheckout = async (priceId: string, amount: number) => {
    if (!user) {
      window.location.href = "/sign-in";
      return;
    }

    try {
      setLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('supabase-functions-razorpay-create-order', {
        body: {
          amount: amount,
          currency: 'INR',
          priceId: priceId,
          userId: user.id,
        }
      });

      if (orderError) {
        throw orderError;
      }

      // Configure Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'YouTube Transcript Extractor',
        description: item.name,
        order_id: orderData.orderId,
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#EC4899', // Pink-500
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('supabase-functions-razorpay-verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
              }
            });

            if (verifyError) {
              throw verifyError;
            }

            // Redirect to success page
            window.location.href = '/success';
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };


    return (
        <Card className={`w-[350px] relative overflow-hidden ${item.popular ? 'border-2 border-red-500 shadow-xl scale-105' : 'border border-gray-200'}`}>
            {item.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-purple-50 opacity-30" />
            )}
            <CardHeader className="relative">
                {item.popular && (
                    <div className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit mb-4">
                        Most Popular
                    </div>
                )}
                <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">{item.name}</CardTitle>
                <CardDescription className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-gray-900">${item?.prices?.[0]?.priceAmount / 100}</span>
                    <span className="text-gray-600">/month</span>
                </CardDescription>
            </CardHeader>
            {item.description &&<CardContent className="relative">
                <ul className="space-y-4">
                    {item.description.split('\n').map((desc: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-600">{desc.trim()}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>}
            <CardFooter className="relative">
                <Button 
                    onClick={async () => {
                        await handleCheckout(item?.prices?.[0]?.id, item?.prices?.[0]?.priceAmount / 100)
                    }} 
                    disabled={loading}
                    className={`w-full py-6 text-lg font-medium ${
                        item.popular 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                >
                    {loading ? 'Processing...' : (user ? 'Subscribe Now' : 'Login to continue')}
                </Button>
            </CardFooter>
        </Card>
    )
}
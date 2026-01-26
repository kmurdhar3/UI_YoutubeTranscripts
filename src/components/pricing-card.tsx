"use client";

import { createClient } from "@/supabase/client";
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

export default function PricingCard({
  item,
  user,
}: {
  item: any;
  user: User | null;
}) {
  const [loading, setLoading] = useState(false);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const supabase = createClient();

  // Parse description to handle different separators (newline, comma, bullet)
  const parseDescription = (description: string) => {
    return description
      .split(/[\n,•]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item !== "1");
  };

  // Handle checkout process with Razorpay
  const handleCheckout = async (priceId: string, amountInPaise: number) => {
    if (!user) {
      window.location.href = "/sign-in";
      return;
    }

    try {
      setLoading(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Create Razorpay order
      // amountInPaise is already in paise (e.g., 99900 for ₹999)
      const { data: orderData, error: orderError } =
        await supabase.functions.invoke(
          "supabase-functions-razorpay-create-order",
          {
            body: {
              amount: amountInPaise, // Amount already in paise
              currency: "INR",
              priceId: priceId,
              userId: user.id,
            },
          },
        );

      // Log the full response for debugging
      console.log("Order response data:", orderData);
      console.log("Order response error:", orderError);

      if (orderError) {
        console.error("Order creation error:", orderError);
        // Try to get the error message from the response context
        const errorMessage =
          orderData?.error || orderError.message || "Failed to create order";
        alert(
          `Payment Error: ${errorMessage}\n\nIf this mentions "credentials not configured", the Razorpay secrets need to be added in Supabase Dashboard → Edge Functions → Secrets.`,
        );
        throw new Error(errorMessage);
      }

      if (!orderData || !orderData.orderId) {
        console.error("Invalid order response:", orderData);
        const errorMessage =
          orderData?.error || "Invalid response from payment server";
        alert(`Payment Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // Configure Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "YouTube Transcript Extractor",
        description: item.name,
        order_id: orderData.orderId,
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#EC4899", // Pink-500
        },
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const { data: verifyData, error: verifyError } =
              await supabase.functions.invoke(
                "supabase-functions-razorpay-verify-payment",
                {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    userId: user.id,
                  },
                },
              );

            if (verifyError) {
              throw verifyError;
            }

            // Redirect to success page
            window.location.href = "/success";
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Card
      className={`w-[350px] relative overflow-hidden ${item.popular ? "border-2 border-red-500 shadow-xl scale-105" : "border border-gray-200"}`}
    >
      {item.popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-purple-50 opacity-30" />
      )}
      <CardHeader className="relative">
        {item.popular && (
          <div className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit mb-4">
            Most Popular
          </div>
        )}
        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
          {item.name}
        </CardTitle>
        <CardDescription className="flex items-baseline gap-2 mt-2">
          <span className="text-4xl font-bold text-gray-900 w-[81px]">
            ₹999
          </span>
          <span className="text-gray-600">/month</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">
              1000 transcripts per month
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">
              90 day history retention
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">Bulk transcripts</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">
              Channel transcripts (500)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">Transcript Summary</span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600">Email support</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="relative">
        <Button
          onClick={async () => {
            await handleCheckout(
              item?.prices?.[0]?.id,
              item?.prices?.[0]?.priceAmount,
            );
          }}
          disabled={loading}
          className={`w-full py-6 text-lg font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white`}
        >
          {loading
            ? "Processing..."
            : user
              ? "Subscribe Now"
              : "Login to continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}

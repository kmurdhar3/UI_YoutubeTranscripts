"use server";

import { api } from "@/lib/polar";
import { encodedRedirect } from "@/utils/utils";
import { Polar } from "@polar-sh/sdk";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || '';
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  // Get the site URL - use the deployed URL in production
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'http://localhost:3000';

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      // Use service role client to bypass RLS for admin operations
      const serviceClient = createServiceClient();
      
      // Check if user already exists in users table
      const { data: existingUser } = await serviceClient
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        // Insert into users table only if not exists
        const { error: updateError } = await serviceClient
          .from('users')
          .insert({
            id: user.id,
            name: fullName,
            full_name: fullName,
            email: email,
            user_id: user.id,
            token_identifier: user.id,
            created_at: new Date().toISOString()
          });

        if (updateError) {
          console.error('Error updating user profile:', updateError);
        }
      }

      // Check if admin user already exists
      const { data: existingAdmin } = await serviceClient
        .from('admin_users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (!existingAdmin) {
        // Also add to admin_users table only if not exists
        const { error: adminError } = await serviceClient
          .from('admin_users')
          .insert({
            email: email.toLowerCase(),
            password_hash: 'supabase_auth', // Not used since we use Supabase Auth
            name: fullName || 'User',
            role: 'super_admin',
            is_active: true,
          });

        if (adminError) {
          console.error('Error creating admin user:', adminError);
        }
      }
    } catch (err) {
      console.error('Error in user profile creation:', err);
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkoutSessionAction = async ({
  productPriceId,
  successUrl,
  customerEmail,
  metadata,
}: {
  productPriceId: string;
  successUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) => {
  const result = await api.checkouts.create({
    productPriceId,
    successUrl,
    customerEmail,
    metadata,
  });

  return result;
}

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }

  return !!subscription;
};

export const manageSubscriptionAction = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error checking subscription status:', error);
    return { error: 'Error checking subscription status' };
  }

  if (!subscription) {
    console.error('No active subscription found');
    return { error: 'No active subscription found' };
  }

  const polar = new Polar({
    server: "sandbox",
    accessToken: process.env.POLAR_ACCESS_TOKEN,
  });

  try {
    const result = await polar.customerSessions.create({
      customerId: subscription.customer_id,
    });

    // Only return the URL to avoid Convex type issues
    return { url: result.customerPortalUrl };
  } catch (error) {
    console.error('Error managing subscription:', error);
    return { error: 'Error managing subscription' };
  }
};

import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

// This endpoint adds a signed-in user to the admin_users table
// Users must first sign up/sign in via Supabase Auth, then this adds them as an admin
export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get the currently signed in user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "No authenticated user found. Please sign in first.", details: userError?.message },
        { status: 401 }
      );
    }
    
    const userEmail = user.email?.toLowerCase();
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }
    
    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", userEmail)
      .single();
    
    if (existingAdmin) {
      // Admin already exists, just return success
      return NextResponse.json({
        success: true,
        message: "User is already registered as admin",
        email: userEmail,
      });
    }
    
    // Create new admin user from the signed-in user
    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        email: userEmail,
        password_hash: "supabase_auth", // Not used since we use Supabase Auth
        name: user.user_metadata?.full_name || user.user_metadata?.name || "Admin",
        role: "super_admin",
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating admin:", error);
      return NextResponse.json(
        { error: "Failed to create admin user", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      email: userEmail,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

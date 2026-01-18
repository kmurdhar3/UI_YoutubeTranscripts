export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { authenticateAdminFromUser } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Authenticate using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if this user is an admin
    const result = await authenticateAdminFromUser(authData.user);

    if (!result.success) {
      // Sign out since they're not an admin
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: result.admin,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

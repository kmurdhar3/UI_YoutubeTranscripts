export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getAdminSession } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current admin's password hash
    const { data: adminData, error: fetchError } = await supabase
      .from("admin_users")
      .select("password_hash")
      .eq("id", admin.id)
      .single();

    if (fetchError || !adminData) {
      return NextResponse.json(
        { error: "Failed to verify current password" },
        { status: 500 }
      );
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, adminData.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", admin.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import { User } from "@supabase/supabase-js";

const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function generateUUID(): string {
  return crypto.randomUUID();
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
}

// Authenticate admin from Supabase Auth user
export async function authenticateAdminFromUser(
  user: User
): Promise<{ success: boolean; error?: string; admin?: AdminUser }> {
  const supabase = await createClient();

  // Check if user exists in admin_users table
  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", user.email?.toLowerCase())
    .eq("is_active", true)
    .single();

  if (error || !admin) {
    return { success: false, error: "You are not authorized to access the admin panel" };
  }

  // Create admin session
  const sessionToken = generateUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const { error: sessionError } = await supabase.from("admin_sessions").insert({
    admin_id: admin.id,
    session_token: sessionToken,
    expires_at: expiresAt.toISOString(),
  });

  if (sessionError) {
    return { success: false, error: "Failed to create session" };
  }

  // Update last login
  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", admin.id);

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return {
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      is_active: admin.is_active,
      last_login_at: admin.last_login_at,
    },
  };
}

// Legacy function for backwards compatibility
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; admin?: AdminUser }> {
  const supabase = await createClient();
  
  // Use Supabase Auth to verify credentials
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { success: false, error: "Invalid credentials" };
  }

  return authenticateAdminFromUser(authData.user);
}

export async function getAdminSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (!sessionToken) {
      return null;
    }

    const supabase = await createClient();

    const { data: session, error } = await supabase
      .from("admin_sessions")
      .select("*, admin_users(*)")
      .eq("session_token", sessionToken)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !session || !session.admin_users) {
      return null;
    }

    const admin = session.admin_users as any;
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      is_active: admin.is_active,
      last_login_at: admin.last_login_at,
    };
  } catch (error) {
    console.error("Error getting admin session:", error);
    return null;
  }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionToken) {
    const supabase = await createClient();
    await supabase
      .from("admin_sessions")
      .delete()
      .eq("session_token", sessionToken);
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminSession();
  if (!admin) {
    throw new Error("Unauthorized");
  }
  return admin;
}

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/supabase/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Use service client to bypass RLS
    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from("subscriptions")
      .select(`
        *,
        users:user_id (
          id,
          email,
          name,
          full_name,
          avatar_url,
          created_at
        )
      `, { count: "exact" });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`polar_id.ilike.%${search}%,customer_id.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: subscriptions, error, count } = await query;

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    // Get statistics
    const { data: stats } = await supabase
      .from("subscriptions")
      .select("status");

    const statusCounts = {
      total: stats?.length || 0,
      active: stats?.filter((s) => s.status === "active").length || 0,
      canceled: stats?.filter((s) => s.status === "canceled").length || 0,
      revoked: stats?.filter((s) => s.status === "revoked").length || 0,
      pending: stats?.filter((s) => s.status === "pending" || s.status === "incomplete").length || 0,
    };

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats: statusCounts,
    });
  } catch (error) {
    console.error("Admin subscriptions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

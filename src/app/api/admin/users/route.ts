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
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Use service client to bypass RLS and see all users
    const supabase = createServiceClient();

    // Build query for users
    let query = supabase
      .from("users")
      .select("*", { count: "exact" });

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Get extraction counts per user from transcript_history
    const { data: extractionCounts } = await supabase
      .from("transcript_history")
      .select("user_id");

    // Count extractions per user
    const extractionCountMap: Record<string, number> = {};
    extractionCounts?.forEach((record) => {
      const userId = record.user_id;
      extractionCountMap[userId] = (extractionCountMap[userId] || 0) + 1;
    });

    // Get subscriptions per user
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("user_id, status, product_name, current_period_end");

    // Map subscriptions per user (get the most recent active one)
    const subscriptionMap: Record<string, { status: string; product_name: string | null; current_period_end: string | null }> = {};
    subscriptions?.forEach((sub) => {
      const userId = sub.user_id;
      // Prefer active subscriptions
      if (!subscriptionMap[userId] || sub.status === "active") {
        subscriptionMap[userId] = {
          status: sub.status,
          product_name: sub.product_name,
          current_period_end: sub.current_period_end,
        };
      }
    });

    // Enrich users with extraction count and subscription info
    const enrichedUsers = users?.map((user) => ({
      ...user,
      extraction_count: extractionCountMap[user.id] || extractionCountMap[user.user_id] || 0,
      subscription_info: subscriptionMap[user.id] || subscriptionMap[user.user_id] || null,
    }));

    // Get user statistics
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get total extractions
    const { count: totalExtractions } = await supabase
      .from("transcript_history")
      .select("*", { count: "exact", head: true });

    // Get users with active subscriptions
    const { data: activeSubscribers } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

    const uniqueActiveSubscribers = new Set(activeSubscribers?.map((s) => s.user_id) || []);

    return NextResponse.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats: {
        total: totalUsers || 0,
        withActiveSubscription: uniqueActiveSubscribers.size,
        totalExtractions: totalExtractions || 0,
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

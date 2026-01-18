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
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, 1y

    // Check if service key is available
    if (!process.env.SUPABASE_SERVICE_KEY) {
      console.error("SUPABASE_SERVICE_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error: Missing service key" },
        { status: 500 }
      );
    }

    // Use service client to bypass RLS and see all data
    const supabase = createServiceClient();

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get new users in period
    const { count: newUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString());

    // Get subscriptions
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("status, amount, currency, created_at, canceled_at, started_at, interval");

    // Calculate subscription stats
    const activeSubscriptions = subscriptions?.filter((s) => s.status === "active").length || 0;
    const canceledInPeriod = subscriptions?.filter(
      (s) => s.canceled_at && new Date(s.canceled_at * 1000) >= startDate
    ).length || 0;
    const newSubscriptionsInPeriod = subscriptions?.filter(
      (s) => s.started_at && new Date(s.started_at * 1000) >= startDate
    ).length || 0;

    // Calculate revenue (monthly recurring)
    const monthlyRevenue = subscriptions
      ?.filter((s) => s.status === "active" && s.amount)
      .reduce((sum, s) => sum + (s.amount || 0), 0) || 0;

    // Get transcript downloads stats
    const { count: totalDownloads } = await supabase
      .from("transcript_history")
      .select("*", { count: "exact", head: true });

    const { count: downloadsInPeriod } = await supabase
      .from("transcript_history")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString());

    // Get total videos extracted (sum of total_videos column)
    const { data: historyData } = await supabase
      .from("transcript_history")
      .select("total_videos");
    
    const totalVideosExtracted = historyData?.reduce((sum, h) => sum + (h.total_videos || 1), 0) || 0;

    // Get history stats per user
    const { data: historyByUser } = await supabase
      .from("transcript_history")
      .select("user_id");
    
    const uniqueUsersWithHistory = new Set(historyByUser?.map(h => h.user_id)).size;

    // Get activity log (recent events from webhook)
    const { data: recentActivity } = await supabase
      .from("webhook_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get recent transcript extractions for activity feed
    const { data: recentExtractions } = await supabase
      .from("transcript_history")
      .select("id, video_title, created_at, user_id, total_videos")
      .order("created_at", { ascending: false })
      .limit(10);

    // Get subscription breakdown by interval
    const intervalBreakdown = {
      monthly: subscriptions?.filter((s) => s.status === "active" && s.interval === "month").length || 0,
      yearly: subscriptions?.filter((s) => s.status === "active" && s.interval === "year").length || 0,
    };

    // Combine recent activity (webhook events + transcript extractions)
    const allActivity = [
      ...(recentActivity?.map((event) => ({
        id: event.id,
        type: event.event_type,
        timestamp: event.created_at,
        data: event.data,
        source: 'webhook' as const,
      })) || []),
      ...(recentExtractions?.map((extraction) => ({
        id: extraction.id,
        type: 'transcript.extracted',
        timestamp: extraction.created_at,
        data: { 
          video_title: extraction.video_title,
          total_videos: extraction.total_videos || 1,
        },
        source: 'extraction' as const,
      })) || []),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        activeSubscriptions,
        monthlyRevenue: monthlyRevenue / 100, // Convert from cents
        totalDownloads: totalDownloads || 0,
        downloadsInPeriod: downloadsInPeriod || 0,
        totalVideosExtracted,
        uniqueUsersWithHistory,
      },
      subscriptions: {
        active: activeSubscriptions,
        canceled: canceledInPeriod,
        new: newSubscriptionsInPeriod,
        total: subscriptions?.length || 0,
        intervalBreakdown,
      },
      history: {
        totalExtractions: totalDownloads || 0,
        extractionsInPeriod: downloadsInPeriod || 0,
        totalVideos: totalVideosExtracted,
        usersWithHistory: uniqueUsersWithHistory,
      },
      recentActivity: allActivity,
      period,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

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
    const limit = parseInt(searchParams.get("limit") || "50");
    const eventType = searchParams.get("eventType");

    // Use service client to bypass RLS
    const supabase = createServiceClient();

    // Build query for webhook events (activity log)
    let query = supabase
      .from("webhook_events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply event type filter
    if (eventType && eventType !== "all") {
      query = query.eq("event_type", eventType);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: events, error, count } = await query;

    if (error) {
      console.error("Error fetching activity:", error);
      return NextResponse.json(
        { error: "Failed to fetch activity" },
        { status: 500 }
      );
    }

    // Get unique event types for filter
    const { data: allEvents } = await supabase
      .from("webhook_events")
      .select("event_type");

    const eventTypes = [...new Set(allEvents?.map((e) => e.event_type) || [])];

    return NextResponse.json({
      events,
      eventTypes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Admin activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

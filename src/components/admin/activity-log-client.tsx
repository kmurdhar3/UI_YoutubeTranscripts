"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  Filter,
  Clock,
  FileJson,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WebhookEvent {
  id: string;
  event_type: string;
  type: string;
  polar_event_id: string | null;
  data: any;
  created_at: string;
  error: string | null;
}

export function ActivityLogClient() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        ...(eventTypeFilter !== "all" && { eventType: eventTypeFilter }),
      });

      const response = await fetch(`/api/admin/activity?${params}`);
      const data = await response.json();

      setEvents(data.events || []);
      setEventTypes(data.eventTypes || []);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [page, eventTypeFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const getEventBadgeColor = (type: string) => {
    if (type.includes("created") || type.includes("active"))
      return "bg-green-500/20 text-green-400";
    if (type.includes("canceled") || type.includes("revoked"))
      return "bg-red-500/20 text-red-400";
    if (type.includes("updated") || type.includes("uncanceled"))
      return "bg-blue-500/20 text-blue-400";
    return "bg-slate-500/20 text-slate-400";
  };

  const formatEventType = (type: string) => {
    return type
      .replace("subscription.", "Subscription ")
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-white"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Activity Log
          </h1>
          <p className="text-slate-400 text-sm">
            Track all subscription events and webhook activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                {eventTypeFilter === "all" ? "All Events" : formatEventType(eventTypeFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 max-h-64 overflow-y-auto">
              <DropdownMenuItem
                onClick={() => {
                  setEventTypeFilter("all");
                  setPage(1);
                }}
                className="text-slate-300 hover:bg-slate-700"
              >
                All Events
              </DropdownMenuItem>
              {eventTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => {
                    setEventTypeFilter(type);
                    setPage(1);
                  }}
                  className="text-slate-300 hover:bg-slate-700"
                >
                  {formatEventType(type)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivity}
            disabled={loading}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{total}</p>
            <p className="text-xs text-slate-400">Total Events</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {events.filter((e) => e.event_type.includes("created")).length}
            </p>
            <p className="text-xs text-slate-400">Created (page)</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {events.filter((e) => e.event_type.includes("updated")).length}
            </p>
            <p className="text-xs text-slate-400">Updated (page)</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {events.filter((e) => e.event_type.includes("canceled")).length}
            </p>
            <p className="text-xs text-slate-400">Canceled (page)</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-700">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading activity...
              </div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No activity found
              </div>
            ) : (
              events.map((event) => {
                const { date, time } = formatDate(event.created_at);
                return (
                  <div
                    key={event.id}
                    className="p-4 hover:bg-slate-700/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getEventBadgeColor(event.event_type)}>
                            {formatEventType(event.event_type)}
                          </Badge>
                          {event.error && (
                            <Badge className="bg-red-500/20 text-red-400">
                              Error
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Event ID: {event.polar_event_id?.slice(0, 16) || event.id.slice(0, 16)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-slate-300">{date}</p>
                        <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {time}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
                            className="text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            <FileJson className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              Event Details
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 overflow-y-auto flex-1">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Event Type</p>
                                <Badge className={getEventBadgeColor(event.event_type)}>
                                  {formatEventType(event.event_type)}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Timestamp</p>
                                <p className="text-sm text-white">{date} {time}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 mb-2">Event Data</p>
                              <pre className="bg-slate-900 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto">
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            </div>
                            {event.error && (
                              <div>
                                <p className="text-xs text-red-400 mb-2">Error</p>
                                <pre className="bg-red-500/10 p-4 rounded-lg text-xs text-red-300 overflow-x-auto">
                                  {event.error}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {events.length} of {total} events
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

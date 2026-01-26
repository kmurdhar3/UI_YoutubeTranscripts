"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CreditCard,
  DollarSign,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Calendar,
  FileText,
  Video,
  History,
} from "lucide-react";
import { AdminUser } from "@/lib/admin-auth";

interface DashboardStats {
  overview: {
    totalUsers: number;
    newUsers: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
    totalDownloads: number;
    downloadsInPeriod: number;
    totalVideosExtracted: number;
    uniqueUsersWithHistory: number;
  };
  subscriptions: {
    active: number;
    canceled: number;
    new: number;
    total: number;
    intervalBreakdown: {
      monthly: number;
      yearly: number;
    };
  };
  history: {
    totalExtractions: number;
    extractionsInPeriod: number;
    totalVideos: number;
    usersWithHistory: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    timestamp: string;
    data: any;
    source?: string;
  }>;
  period: string;
}

interface AdminDashboardClientProps {
  admin: AdminUser;
}

export function AdminDashboardClient({ admin }: AdminDashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await response.json();
      if (!response.ok || data.error) {
        console.error("Failed to fetch stats:", data.error);
        setStats(null);
        return;
      }
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatEventType = (type: string) => {
    return type
      .replace("subscription.", "")
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getEventBadgeColor = (type: string) => {
    if (type.includes("created") || type.includes("active")) return "bg-green-500/20 text-green-400";
    if (type.includes("canceled") || type.includes("revoked")) return "bg-red-500/20 text-red-400";
    if (type.includes("updated")) return "bg-blue-500/20 text-blue-400";
    if (type.includes("extracted")) return "bg-orange-500/20 text-orange-400";
    return "bg-slate-500/20 text-slate-400";
  };

  const formatEventDetails = (event: { type: string; data: any }) => {
    if (event.type === 'transcript.extracted' && event.data?.video_title) {
      const title = event.data.video_title.length > 30 
        ? event.data.video_title.substring(0, 30) + '...' 
        : event.data.video_title;
      const videos = event.data.total_videos > 1 ? ` (+${event.data.total_videos - 1} more)` : '';
      return `${title}${videos}`;
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {admin.name || "Admin"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1 overflow-x-auto">
            {["7d", "30d", "90d", "1y"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.overview?.totalUsers?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />+{stats?.overview?.newUsers || 0} new
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.subscriptions?.active?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />+{stats?.subscriptions?.new || 0} new
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats?.overview?.monthlyRevenue || 0)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  from {stats?.subscriptions?.active || 0} subs
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Extractions</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.history?.totalExtractions.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />+
                  {stats?.history?.extractionsInPeriod || 0} this period
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Videos Extracted</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.overview?.totalVideosExtracted?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  total videos processed
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Users (w/ History)</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.overview?.uniqueUsersWithHistory?.toLocaleString() || "0"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  users with extractions
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Extractions/User</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.overview?.uniqueUsersWithHistory && stats?.history?.totalExtractions
                    ? (stats.history.totalExtractions / stats.overview.uniqueUsersWithHistory).toFixed(1)
                    : "0"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  per active user
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.overview?.totalUsers && stats?.subscriptions?.active
                    ? ((stats.subscriptions.active / stats.overview.totalUsers) * 100).toFixed(1)
                    : "0"}%
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  users to subscribers
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subscription Breakdown */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Subscription Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Monthly Plans</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.subscriptions?.intervalBreakdown?.monthly || 0}
                </p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Yearly Plans</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.subscriptions?.intervalBreakdown?.yearly || 0}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Active</span>
                <Badge className="bg-green-500/20 text-green-400">
                  {stats?.subscriptions?.active || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Canceled (this period)</span>
                <Badge className="bg-red-500/20 text-red-400">
                  {stats?.subscriptions?.canceled || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total All Time</span>
                <Badge className="bg-slate-500/20 text-slate-400">
                  {stats?.subscriptions?.total || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History & Usage Stats */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <History className="w-4 h-4" />
              History & Downloads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Total Extractions</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.history?.totalExtractions?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Videos Processed</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.history?.totalVideos?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Users w/ History</span>
                <Badge className="bg-cyan-500/20 text-cyan-400">
                  {stats?.history?.usersWithHistory || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Extractions (this period)</span>
                <Badge className="bg-orange-500/20 text-orange-400">
                  {stats?.history?.extractionsInPeriod || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Avg per User</span>
                <Badge className="bg-amber-500/20 text-amber-400">
                  {stats?.history?.usersWithHistory && stats?.history?.totalExtractions
                    ? (stats.history.totalExtractions / stats.history.usersWithHistory).toFixed(1)
                    : "0"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getEventBadgeColor(event.type)}>
                          {formatEventType(event.type)}
                        </Badge>
                      </div>
                      {formatEventDetails(event) && (
                        <span className="text-xs text-slate-400 pl-1">
                          {formatEventDetails(event)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

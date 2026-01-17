"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Calendar,
  DollarSign,
  User,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Subscription {
  id: string;
  polar_id: string | null;
  user_id: string | null;
  status: string | null;
  amount: number | null;
  currency: string | null;
  interval: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  started_at: number | null;
  canceled_at: number | null;
  created_at: string;
  users?: {
    id: string;
    email: string | null;
    name: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface SubscriptionStats {
  total: number;
  active: number;
  canceled: number;
  revoked: number;
  pending: number;
}

export function SubscriptionsListClient() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/subscriptions?${params}`);
      const data = await response.json();

      setSubscriptions(data.subscriptions || []);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "canceled":
        return "bg-red-500/20 text-red-400";
      case "revoked":
        return "bg-red-700/20 text-red-500";
      case "pending":
      case "incomplete":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
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
            Subscriptions
          </h1>
          <p className="text-slate-400 text-sm">
            Manage and monitor all subscription plans
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSubscriptions}
          disabled={loading}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats?.total || 0, color: "text-white" },
          { label: "Active", value: stats?.active || 0, color: "text-green-400" },
          { label: "Canceled", value: stats?.canceled || 0, color: "text-red-400" },
          { label: "Revoked", value: stats?.revoked || 0, color: "text-red-500" },
          { label: "Pending", value: stats?.pending || 0, color: "text-yellow-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search by Polar ID or Customer ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600"
              >
                Search
              </Button>
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === "all" ? "All Status" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                {["all", "active", "canceled", "revoked", "pending"].map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setPage(1);
                    }}
                    className="text-slate-300 hover:bg-slate-700 capitalize"
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase">
                    User
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase">
                    Plan
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase">
                    Amount
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase">
                    Started
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase">
                    Period End
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading subscriptions...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {sub.users?.full_name || sub.users?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {sub.users?.email || sub.user_id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-white capitalize">
                            {sub.interval || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-white">
                            {formatCurrency(sub.amount, sub.currency)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(sub.status)}>
                          {sub.status || "unknown"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(sub.started_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(sub.current_period_end)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {subscriptions.length} of {total} subscriptions
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

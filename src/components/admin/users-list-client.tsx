"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Download,
} from "lucide-react";

interface SubscriptionInfo {
  status: string;
  product_name: string | null;
  current_period_end: string | null;
}

interface UserData {
  id: string;
  user_id: string | null;
  email: string | null;
  name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  subscription: string | null;
  extraction_count: number;
  subscription_info: SubscriptionInfo | null;
}

interface UserStats {
  total: number;
  withActiveSubscription: number;
  totalExtractions: number;
}

export function UsersListClient() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      setUsers(data.users || []);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            Users
          </h1>
          <p className="text-slate-400 text-sm">
            View and manage all registered users
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.total.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Subscribers</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.withActiveSubscription || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Extractions</p>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalExtractions?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
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
                    Email
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase">
                    Extractions
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase">
                    Subscription
                  </th>
                  <th className="text-left p-4 text-xs font-medium text-slate-400 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name || "User"}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">
                              {user.full_name || user.name || "Unknown User"}
                            </p>
                            <p className="text-xs text-slate-500">
                              ID: {user.user_id?.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-300">
                            {user.email || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-white">
                            {user.extraction_count}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {user.subscription_info ? (
                          <div className="space-y-1">
                            <Badge
                              className={
                                user.subscription_info.status === "active"
                                  ? "bg-green-500/20 text-green-400"
                                  : user.subscription_info.status === "canceled"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-slate-500/20 text-slate-400"
                              }
                            >
                              {user.subscription_info.status}
                            </Badge>
                            {user.subscription_info.product_name && (
                              <p className="text-xs text-slate-500">
                                {user.subscription_info.product_name}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge className="bg-slate-500/20 text-slate-400">
                            Free
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(user.created_at)}
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
              Showing {users.length} of {total} users
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

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { AdminUser } from "@/lib/admin-auth";

interface AdminSettingsClientProps {
  admin: AdminUser;
}

export function AdminSettingsClient({ admin }: AdminSettingsClientProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Failed to change password" });
        return;
      }

      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-white"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Settings
        </h1>
        <p className="text-slate-400 text-sm">
          Manage your admin account settings
        </p>
      </div>

      {/* Profile Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-slate-400">
            Your admin account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {admin.name || "Admin"}
              </h3>
              <p className="text-slate-400 text-sm">{admin.email}</p>
              <Badge className="mt-2 bg-blue-500/20 text-blue-400">
                {admin.role === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <div>
              <p className="text-xs text-slate-500 mb-1">Account Status</p>
              <Badge className="bg-green-500/20 text-green-400">
                Active
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Last Login</p>
              <p className="text-sm text-slate-300">
                {admin.last_login_at
                  ? new Date(admin.last_login_at).toLocaleString()
                  : "First login"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription className="text-slate-400">
            Update your admin password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {message && (
              <div
                className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {message.type === "success" && <CheckCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-slate-300">
                Current Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-400">
          <p>• Sessions expire after 24 hours of inactivity</p>
          <p>• All admin actions are logged for audit purposes</p>
          <p>• Use a strong, unique password for your admin account</p>
          <p>• Contact the system administrator to add new admin users</p>
        </CardContent>
      </Card>
    </div>
  );
}

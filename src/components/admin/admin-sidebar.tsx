"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  adminName?: string | null;
  adminEmail?: string;
}

export function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white hover:bg-slate-700"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 z-50 flex flex-col",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-white font-bold text-lg" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Admin
                  </h1>
                  <p className="text-slate-500 text-xs">TranscriptX</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hidden lg:flex"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn("w-4 h-4", collapsed && "rotate-180")} />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          {!collapsed && (
            <div className="mb-4 px-3">
              <p className="text-white text-sm font-medium truncate">
                {adminName || "Admin"}
              </p>
              <p className="text-slate-500 text-xs truncate">{adminEmail}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10",
              collapsed && "justify-center px-0"
            )}
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}

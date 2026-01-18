export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export default async function AdminDashboardPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminDashboardClient admin={admin} />;
}

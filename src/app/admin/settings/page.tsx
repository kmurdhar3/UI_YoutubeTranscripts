import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminSettingsClient } from "@/components/admin/admin-settings-client";

export default async function AdminSettingsPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminSettingsClient admin={admin} />;
}

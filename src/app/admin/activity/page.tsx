import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { ActivityLogClient } from "@/components/admin/activity-log-client";

export default async function AdminActivityPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return <ActivityLogClient />;
}

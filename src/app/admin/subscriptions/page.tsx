export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { SubscriptionsListClient } from "@/components/admin/subscriptions-list-client";

export default async function AdminSubscriptionsPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return <SubscriptionsListClient />;
}

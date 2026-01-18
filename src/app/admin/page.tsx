export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminPage() {
  const admin = await getAdminSession();

  if (admin) {
    redirect("/admin/dashboard");
  } else {
    redirect("/admin/login");
  }
}

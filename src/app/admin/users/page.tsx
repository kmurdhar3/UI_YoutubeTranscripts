import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { UsersListClient } from "@/components/admin/users-list-client";

export default async function AdminUsersPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return <UsersListClient />;
}

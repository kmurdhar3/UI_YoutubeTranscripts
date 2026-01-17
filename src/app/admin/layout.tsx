import { getAdminSession } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin = null;
  
  try {
    admin = await getAdminSession();
  } catch (error) {
    // Session fetch failed, continue without admin
    console.error("Failed to fetch admin session:", error);
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {admin ? (
        <>
          <AdminSidebar adminName={admin.name} adminEmail={admin.email} />
          <main className="lg:pl-64 min-h-screen">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </>
      ) : (
        children
      )}
    </div>
  );
}

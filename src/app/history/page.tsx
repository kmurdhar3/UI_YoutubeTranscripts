import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { TranscriptHistoryClient } from "@/components/transcript-history-client";
import DashboardNavbar from "@/components/dashboard-navbar";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <TranscriptHistoryClient userId={user.id} />
        </div>
      </div>
    </div>
  );
}

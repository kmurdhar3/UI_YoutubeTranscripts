import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { TranscriptHistory } from "@/components/transcript-history";
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
              Transcript History
            </h1>
            <p className="text-lg text-gray-600">
              View and manage your transcript download history
            </p>
          </div>
          
          <TranscriptHistory userId={user.id} />
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut } from "lucide-react";
import { ReportsTable } from "@/components/reports-table";
import AppLogo from "@/components/app-logo";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/admin/login");
  }

  // Fetch admin profile
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  // Fetch all reports
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <AppLogo />
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium text-foreground">{profile?.full_name || "Admin"}</p>
              {profile?.department && <p className="text-muted-foreground">{profile.department}</p>}
            </div>
            <form action="/api/auth/logout" method="POST">
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Reports Dashboard</h2>
          <p className="text-muted-foreground">Manage and update the status of community reports</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-3xl font-bold text-red-500">
              {reports?.filter((r) => r.status === "pending").length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">In Progress</p>
            <p className="text-3xl font-bold text-orange-500">
              {reports?.filter((r) => r.status === "in-progress").length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Resolved</p>
            <p className="text-3xl font-bold text-green-500">
              {reports?.filter((r) => r.status === "resolved").length || 0}
            </p>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg border border-border">
          <ReportsTable reports={reports || []} />
        </div>
      </div>
    </div>
  );
}

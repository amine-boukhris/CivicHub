"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowLeft, Mail, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AppLogo from "@/components/app-logo";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setIsLoading(false);
    };

    getUser();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppLogo />
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-3xl font-bold mb-6">My Profile</h2>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#2E5BFF] flex items-center justify-center text-white text-2xl font-medium">
                {user?.email?.[0].toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-medium text-foreground">User Account</p>
                <p className="text-sm text-muted-foreground">CivicHub Member</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user?.email}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  Member since {new Date(user?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Link href="/report" className="flex-1">
            <Button className="w-full bg-[#2E5BFF] hover:bg-[#1E3A8A]">Report an Issue</Button>
          </Link>
          <Link href="/map" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              View Map
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

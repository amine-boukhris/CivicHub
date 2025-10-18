import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createClient();
    const communitySlug = params.slug;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: community, error } = await supabase
      .from("communities")
      .select("*")
      .eq("slug", communitySlug)
      .single();

    if (error) throw error;

    let isMember = false;
    let isAdmin = false;

    if (user) {
      const {data: membership} = await supabase.from("community_members").select("role, status")
    }
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json({ error: "Failed to fetch community" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {}

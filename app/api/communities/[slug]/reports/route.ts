import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createClient();
    const communitySlug = params.slug;

    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("community_id")
      .eq("slug", communitySlug)
      .single();

    if (communityError) throw communityError;

    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .eq("community_id", community.community_id)
      .order("created_at", { ascending: true });

    if (reportsError) throw reportsError;

    return NextResponse.json(reports || []);
  } catch (error) {
    console.error("Error fetching community reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

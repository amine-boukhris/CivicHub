import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createClient();
    const { slug } = params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("id, is_active")
      .eq("slug", slug)
      .single();
    if (communityError) throw communityError;
    if (!community?.is_active)
      return NextResponse.json({ error: "Community inactive" }, { status: 400 });

    const { data: existing } = await supabase
      .from("community_members")
      .select("id, role")
      .eq("community_id", community.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ joined: true, role: existing.role });
    }

    const { error: insertError } = await supabase
      .from("community_members")
      .insert({ community_id: community.id, user_id: user.id, role: "member" });
    if (insertError) throw insertError;

    return NextResponse.json({ joined: true, role: "member" }, { status: 201 });
  } catch (error) {
    console.error("Error joining community:", error);
    return NextResponse.json({ error: "Failed to join community" }, { status: 500 });
  }
}

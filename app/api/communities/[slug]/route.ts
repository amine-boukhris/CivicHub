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
      // Determine membership and admin status for the user
      const { data, error: membershipError } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", community.id)
        .eq("user_id", user.id)
        .single();

      if (data || user.id === community.admin_id) {
        isMember = true;
        isAdmin = data?.role === "admin" || user.id === community.admin_id;
      }
    }

    return NextResponse.json({
      community,
      isMember,
      isAdmin,
    });
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json({ error: "Failed to fetch community" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createClient();
    const communitySlug = params.slug;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get community and verify admin permissions
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("id, admin_id")
      .eq("slug", communitySlug)
      .single();

    if (communityError) throw communityError;
    if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

    // Check if user is admin (either community admin_id or has admin role in community_members)
    let isAdmin = user.id === community.admin_id;

    if (!isAdmin) {
      const { data: membership } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", community.id)
        .eq("user_id", user.id)
        .single();

      isAdmin = membership?.role === "admin";
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Parse and validate update data
    const body = await request.json();
    const allowedFields = [
      "name",
      "description",
      "center_lat",
      "center_lng",
      "address",
      "radius_km",
      "icon_url",
      "banner_url",
      "category",
      "is_active",
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update community
    const { data: updatedCommunity, error: updateError } = await supabase
      .from("communities")
      .update(updateData)
      .eq("id", community.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ community: updatedCommunity });
  } catch (error) {
    console.error("Error updating community:", error);
    return NextResponse.json({ error: "Failed to update community" }, { status: 500 });
  }
}

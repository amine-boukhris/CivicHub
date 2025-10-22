import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest, 
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const supabase = await createClient();
    const { slug, id } = params;

    // Get community by slug
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("id")
      .eq("slug", slug)
      .single();

    if (communityError) {
      console.error("Community error:", communityError);
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    // Get report by ID and verify it belongs to this community
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .eq("community_id", community.id)
      .single();

    if (reportError) {
      console.error("Report error:", reportError);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const supabase = await createClient();
    const { slug, id } = params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get community by slug
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("id, admin_id")
      .eq("slug", slug)
      .single();

    if (communityError) {
      console.error("Community error:", communityError);
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    // Get report and verify it belongs to this community
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("user_id, community_id, resolved_at")
      .eq("id", id)
      .eq("community_id", community.id)
      .single();

    if (reportError) {
      console.error("Report error:", reportError);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check authorization: user must be report owner, community admin, or community admin member
    let isAuthorized = user.id === report.user_id || user.id === community.admin_id;
    
    if (!isAuthorized) {
      const { data: membership } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", community.id)
        .eq("user_id", user.id)
        .single();
      
      isAuthorized = membership?.role === "admin";
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Not authorized to update this report" }, { status: 403 });
    }

    // Parse and validate update data
    const body = await request.json();
    const allowedFields = [
      'title', 'description', 'category', 'status', 'priority', 
      'lat', 'lng', 'address', 'image_url', 'resolution_notes'
    ];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // If status is being set to resolved, set resolved_at
    if (updateData.status === 'resolved' && !report.resolved_at) {
      updateData.resolved_at = new Date().toISOString();
    }

    // Update report
    const { data: updatedReport, error: updateError } = await supabase
      .from("reports")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const supabase = await createClient();
    const { slug, id } = params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get community by slug
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("id, admin_id")
      .eq("slug", slug)
      .single();

    if (communityError) {
      console.error("Community error:", communityError);
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    // Get report and verify it belongs to this community
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("user_id, community_id")
      .eq("id", id)
      .eq("community_id", community.id)
      .single();

    if (reportError) {
      console.error("Report error:", reportError);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check authorization: user must be report owner, community admin, or community admin member
    let isAuthorized = user.id === report.user_id || user.id === community.admin_id;
    
    if (!isAuthorized) {
      const { data: membership } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", community.id)
        .eq("user_id", user.id)
        .single();
      
      isAuthorized = membership?.role === "admin";
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Not authorized to delete this report" }, { status: 403 });
    }

    // Delete report
    const { error: deleteError } = await supabase
      .from("reports")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}

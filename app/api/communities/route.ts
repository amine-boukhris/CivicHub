import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: communities, error } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(communities)
  } catch (error) {
    console.error("Error fetching communitites:", error);
    return NextResponse.json({ error: "Failed to fetch communities" }, { status: 500 });
  }
}

interface Body {
  name: string;
  description?: string;
  center_lat: number;
  center_lng: number;
  address?: string;
  radius_km?: number;
  category: "city" | "neighborhood" | "district" | "campus" | "region";
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: Body = await request.json();
    // what do we expect from the user, aka the creator of this community
    // they must provide the required attributes for a community
    const { name, description, center_lat, center_lng, address, radius_km, category } = body;

    if (!name || !center_lat || !center_lng) {
      return NextResponse.json({ error: "Name and coordinates are required" }, { status: 400 });
    }

    const location = `POINT(${center_lng} ${center_lat})`;

    const { data: community, error } = await supabase
      .from("communities")
      .insert({
        name,
        center_lat,
        center_lng,
        location,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(community);
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 });
  }
}

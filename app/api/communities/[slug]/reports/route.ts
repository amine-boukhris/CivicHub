import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const supabase = await createClient();
        const communitySlug = params.slug;

        const { data: community, error: communityError } = await supabase
            .from("communities")
            .select("id")
            .eq("slug", communitySlug)
            .single();

        if (communityError || !community) {
            return NextResponse.json(
                { error: "Community not found" },
                { status: 404 }
            );
        }

        const { data: reports, error: reportsError } = await supabase
            .from("reports")
            .select("*")
            .eq("community_id", community.id)
            .order("created_at", { ascending: true });

        if (reportsError) throw reportsError;

        console.log(reports)
        return NextResponse.json(reports || []);
    } catch (error) {
        console.error("Error fetching community reports:", error);
        return NextResponse.json(
            { error: "Failed to fetch reports" },
            { status: 500 }
        );
    }
}

interface Body {
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    imageUrl: string;
    address: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const supabase = await createClient();
        const communitySlug = params.slug;
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const { data: community, error: communityError } = await supabase
            .from("communities")
            .select("id")
            .eq("slug", communitySlug)
            .single();

        if (communityError || !community) {
            return NextResponse.json(
                { error: "Community not found" },
                { status: 404 }
            );
        }

        const body: Body = await request.json();
        const {
            title,
            description,
            category,
            latitude,
            longitude,
            imageUrl,
            address,
        } = body;
        if (!title || !category || !latitude || !longitude) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const location = `POINT(${longitude} ${latitude})`;

        const { data: report, error: reportError } = await supabase
            .from("reports")
            .insert({
                title,
                description,
                category,
                lat: latitude,
                lng: longitude,
                location,
                image_url: imageUrl,
                address,
                community_id: community.id,
                user_id: user.id,
            })
            .select()
            .single();

        if (reportError || !report) {
            console.log(reportError);
            return NextResponse.json(
                { error: "Failed to create report" },
                { status: 500 }
            );
        }

        console.log(report);
        return NextResponse.json({ success: true, report }, { status: 201 });
    } catch (error) {
        console.error("Error creating report:", error);
        return NextResponse.json(
            { error: "Failed to create report" },
            { status: 500 }
        );
    }
}

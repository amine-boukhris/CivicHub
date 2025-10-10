import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { title, description, category, latitude, longitude, address, image_url } = body

    // Validate required fields
    if (!title || !description || !category || !latitude || !longitude) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert report into database
    const { data, error } = await supabase
      .from("reports")
      .insert({
        title,
        description,
        category,
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
        address: address || null,
        image_url: image_url || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

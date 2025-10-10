import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Update report status
    const { data, error } = await supabase.from("reports").update({ status }).eq("id", id).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update report" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error updating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete report
    const { error } = await supabase.from("reports").delete().eq("id", id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete report" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

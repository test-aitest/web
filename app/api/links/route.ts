import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET: fetch all links for a profile
export async function GET(request: NextRequest) {
  const profileId = request.nextUrl.searchParams.get("profile_id");

  if (!profileId) {
    return NextResponse.json({ error: "profile_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST: create a new link
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("social_links")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PUT: update a link
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("social_links")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE: remove a link
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("social_links")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

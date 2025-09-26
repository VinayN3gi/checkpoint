import { NextResponse } from "next/server";

let messages = []; // in-memory store

export async function POST(req) {
  const { message } = await req.json();
  messages.push(message);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const data = [...messages];
  messages = []; // clear after reading so they're not repeated
  return NextResponse.json(data);
}
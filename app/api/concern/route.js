import { NextResponse } from "next/server";

let concerns = [];

export async function POST(req) {
  const { message } = await req.json();
  concerns.push(message);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const data = [...concerns];
  concerns = []; // clear after reading so they're not repeated
  return NextResponse.json(data);
}
import { NextResponse } from "next/server";
import { studyResourcesFlag } from "@/flags";

// Lets client-side navigation know whether to show the resource links without
// evaluating the flag in the root layout, which would make every route dynamic.
export async function GET() {
  return NextResponse.json({ enabled: await studyResourcesFlag() });
}

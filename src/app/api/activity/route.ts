import { NextResponse } from "next/server";
import { fetchActivityData } from "../../../lib/activityService";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const githubUsername = (searchParams.get("githubUsername") ?? "").trim();
    const leetcodeUsername = (searchParams.get("leetcodeUsername") ?? "").trim();

    if (!githubUsername) {
        return NextResponse.json(
            { ok: false, error: "githubUsername query param is required." },
            { status: 400 }
        );
    }

    if (!leetcodeUsername) {
        return NextResponse.json(
            { ok: false, error: "leetcodeUsername query param is required." },
            { status: 400 }
        );
    }

    try {
        const data = await fetchActivityData(githubUsername, leetcodeUsername);

        if (!data.sources.github.ok && !data.sources.leetcode.ok) {
            return NextResponse.json(
                { ...data, ok: false, error: "Failed to fetch activity from both sources." },
                { status: 502 }
            );
        }

        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: err instanceof Error ? err.message : "Internal server error." },
            { status: 500 }
        );
    }
}

"use client";

import { useEffect, useState } from "react";

interface ActivityResponse {
    ok: true;
    params: {
        githubUsername: string;
        leetcodeUsername: string;
    };
    sources: {
        github: {
            totalContributions: number;
            days: Array<{
                date: string;
                count: number;
                level: 0 | 1 | 2 | 3 | 4;
            }>;
        };
        leetcode: {
            totalSubmissions: number;
            days: Array<{
                date: string;
                count: number;
                level: 0 | 1 | 2 | 3 | 4;
            }>;
        };
    };
    merged: Array<{
        date: string;
        github: number;
        leetcode: number;
        total: number;
    }>;
}

interface ActivityErrorResponse {
    ok: false;
    error: string;
    params: {
        githubUsername: string;
        leetcodeUsername: string;
    };
    sources: {
        github: { ok: false; error: string };
        leetcode: { ok: false; error: string };
    };
}

type ActivityDataResponse = ActivityResponse | ActivityErrorResponse;

const getColorForMerged = (count: number, maxCount: number): string => {
    if (count === 0) return "bg-zinc-700/50";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "bg-green-700";
    if (ratio <= 0.5) return "bg-green-600";
    if (ratio <= 0.75) return "bg-green-500";
    return "bg-green-400";
};

export function MyActivity({
    githubUsername = "aditya-dawadikar",
    leetcodeUsername = "chandler_1812",
}: {
    githubUsername?: string;
    leetcodeUsername?: string;
}) {
    const [data, setData] = useState<ActivityDataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<"merged" | "github" | "leetcode">("merged");

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/activity?githubUsername=${githubUsername}&leetcodeUsername=${leetcodeUsername}`
                );
                const json = await response.json();
                if (response.ok) {
                    setData(json);
                    setError(null);
                } else {
                    setData(json);
                    setError(json.error || "Failed to fetch activity");
                }
            } catch (err) {
                setError(`Error fetching activity: ${err instanceof Error ? err.message : "Unknown error"}`);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [githubUsername, leetcodeUsername]);

    if (loading) {
        return (
            <div className="rounded-lg border border-white/15 bg-black/45 p-6">
                <div className="flex items-center justify-center h-32">
                    <p className="text-zinc-400">Loading activity data...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="rounded-lg border border-white/15 bg-black/45 p-6">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">My Activity</h3>
                <div className="flex items-center justify-center h-32">
                    <p className="text-red-400">{error || "Failed to load activity data"}</p>
                </div>
            </div>
        );
    }

    if (!data.ok) {
        return (
            <div className="rounded-lg border border-white/15 bg-black/45 p-6">
                <div className="space-y-2">
                    <p className="text-zinc-300">Unable to fetch some activity data:</p>
                    <ul className="text-sm text-zinc-400 space-y-1 ml-4">
                        {data.sources.github.ok === false && (
                            <li>• GitHub: {data.sources.github.error}</li>
                        )}
                        {data.sources.leetcode.ok === false && (
                            <li>• LeetCode: {data.sources.leetcode.error}</li>
                        )}
                    </ul>
                </div>
            </div>
        );
    }

    // Get the data source based on selected view
    let activitySource: Array<{ date: string; count: number }>;

    if (view === "github") {
        activitySource = data.sources.github.days.map((d) => ({
            date: d.date,
            count: d.count,
        }));
    } else if (view === "leetcode") {
        activitySource = data.sources.leetcode.days.map((d) => ({
            date: d.date,
            count: d.count,
        }));
    } else {
        // merged view
        activitySource = data.merged.map((d) => ({
            date: d.date,
            count: d.total,
        }));
    }

    // Create a map of dates to activity counts
    const activityMap = new Map(activitySource.map((day) => [day.date, day.count]));

    // Find max count for this view
    const viewMaxCount = Math.max(
        ...activitySource.map((d) => d.count),
        1
    );

    // Generate last 365 days starting from today
    const today = new Date();
    const daysArray: Array<{ date: string; count: number } | null> = [];

    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const count = activityMap.get(dateStr);

        if (count !== undefined) {
            daysArray.push({
                date: dateStr,
                count: count,
            });
        } else {
            daysArray.push(null);
        }
    }

    // Group into weeks (columns) with 7 rows each
    const weeks: Array<Array<{ date: string; count: number } | null>> = [];
    for (let i = 0; i < daysArray.length; i += 7) {
        weeks.push(daysArray.slice(i, i + 7));
    }

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Show a month label at the first week where that month appears.
    const monthLabels = weeks.map((week, weekIndex) => {
        const firstDay = week.find((d) => d !== null);
        if (!firstDay) return "";

        const date = new Date(firstDay.date);
        const label = date.toLocaleString("en-US", { month: "short" });

        if (weekIndex === 0) return label;

        const prevFirstDay = weeks[weekIndex - 1].find((d) => d !== null);
        if (!prevFirstDay) return label;

        const prevDate = new Date(prevFirstDay.date);
        return prevDate.getMonth() === date.getMonth() ? "" : label;
    });

    return (
        <div className="rounded-lg border border-white/15 bg-black/45 p-6">
            <p className="text-sm text-zinc-400 mb-4">
                Unified view of GitHub contributions and LeetCode submissions (last 365 days)
            </p>

            {/* View Toggle Buttons */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setView("merged")}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${view === "merged"
                            ? "bg-green-600 text-white"
                            : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50"
                        }`}
                >
                    Merged
                </button>
                <button
                    onClick={() => setView("github")}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${view === "github"
                            ? "bg-green-600 text-white"
                            : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50"
                        }`}
                >
                    GitHub
                </button>
                <button
                    onClick={() => setView("leetcode")}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${view === "leetcode"
                            ? "bg-green-600 text-white"
                            : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50"
                        }`}
                >
                    LeetCode
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-zinc-800/50 rounded p-3">
                    <p className="text-xs text-zinc-400">GitHub</p>
                    <p className="text-lg font-semibold text-green-400">
                        {data.sources.github.totalContributions}
                    </p>
                </div>
                <div className="bg-zinc-800/50 rounded p-3">
                    <p className="text-xs text-zinc-400">LeetCode</p>
                    <p className="text-lg font-semibold text-green-400">
                        {data.sources.leetcode.totalSubmissions}
                    </p>
                </div>
                <div className="bg-zinc-800/50 rounded p-3">
                    <p className="text-xs text-zinc-400">Combined</p>
                    <p className="text-lg font-semibold text-green-400">
                        {data.sources.github.totalContributions +
                            data.sources.leetcode.totalSubmissions}
                    </p>
                </div>
            </div>

            {/* Activity Grid */}
            <div className="overflow-x-auto mb-4">
                <div className="min-w-max">
                    <div className="mb-1 flex gap-0.5 pl-10">
                        {monthLabels.map((label, weekIndex) => (
                            <div
                                key={`month-${weekIndex}`}
                                className="w-3 text-[10px] leading-none text-zinc-300"
                            >
                                {label}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-0.5 pb-2">
                        {/* Day labels */}
                        <div className="flex flex-col gap-0.5 pr-2">
                            {dayNames.map((day) => (
                                <div key={day} className="h-3 w-8 text-xs text-zinc-300 flex items-center justify-end pr-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Weeks grid */}
                        {weeks.map((week, weekIndex) => (
                            <div key={`week-${weekIndex}`} className="flex flex-col gap-0.5">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={`${weekIndex}-${dayIndex}`}
                                        className={`w-3 h-3 rounded-sm ${day ? getColorForMerged(day.count, viewMaxCount) : "bg-zinc-700/50"
                                            } hover:opacity-80 transition-opacity cursor-pointer group relative`}
                                        title={
                                            day
                                                ? `${day.date}: ${day.count} ${view === "merged" ? "total" : view === "github" ? "contributions" : "submissions"}`
                                                : "No data"
                                        }
                                    >
                                        {day && (
                                            <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black border border-white/25 rounded px-2 py-1 text-xs text-zinc-100 whitespace-nowrap z-[9999]">
                                                {day.date}: {day.count} {view === "merged" ? "total" : view === "github" ? "contributions" : "submissions"}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-4">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-700/50 rounded-sm" />
                    <div className="w-2 h-2 bg-green-700 rounded-sm" />
                    <div className="w-2 h-2 bg-green-600 rounded-sm" />
                    <div className="w-2 h-2 bg-green-500 rounded-sm" />
                    <div className="w-2 h-2 bg-green-400 rounded-sm" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { globalComponents } from "../../components/mdx";

const RAW_URL =
  "https://raw.githubusercontent.com/Aditya-Dawadikar/AI_Engineer_2026/master/README.md";

export default function Page() {
  const [readme, setReadme] = useState<string | null>(null);
  const storageKey = `readme:${RAW_URL}`;

  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const navType = navEntries.length ? navEntries[0].type : (performance as any).navigation?.type === 1 ? "reload" : "navigate";

    const fetchReadme = () => {
      fetch(`/api/readme?url=${encodeURIComponent(RAW_URL)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          const text = await res.text();
          localStorage.setItem(storageKey, text);
          setReadme(text);
        })
        .catch((err) => setReadme(`Error fetching README: ${String(err)}`));
    };

    if (navType === "reload") {
      // Always fetch on full page reload
      fetchReadme();
    } else {
      // On client-side navigation, check cache first
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setReadme(cached);
      } else {
        // If no cache, fetch it
        fetchReadme();
      }
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 mt-4 md:mt-0">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-100">AI Engineering</h1>
        <p className="text-sm text-zinc-300">
          Source repo:{" "}
          <a
            href="https://github.com/Aditya-Dawadikar/AI_Engineer_2026"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-zinc-100 hover:text-white"
          >
            Aditya-Dawadikar/AI_Engineer_2026
          </a>
        </p>
      </div>

      <article className="prose prose-lg max-w-none rounded-2xl border border-white/10 bg-black/50 p-6 text-zinc-300 prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-li:text-zinc-300 prose-a:text-zinc-100 prose-code:text-zinc-100 prose-pre:bg-black/70">
        {readme ? (
          <ReactMarkdown components={globalComponents as any}>{readme}</ReactMarkdown>
        ) : (
          <p className="text-zinc-300">Loading...</p>
        )}
      </article>
    </div>
  );
}
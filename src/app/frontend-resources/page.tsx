"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { globalComponents } from "../../components/mdx";

const RAW_URL =
  "https://raw.githubusercontent.com/Aditya-Dawadikar/FrontEnd_Engneer_2025/master/README.md";

export default function Page() {
  const [readme, setReadme] = useState<string | null>(null);
  const storageKey = `readme:${RAW_URL}`;

  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const navType = navEntries.length ? navEntries[0].type : (performance as any).navigation?.type === 1 ? "reload" : "navigate";

    const loadFromLocal = () => {
      const cached = localStorage.getItem(storageKey);
      if (cached) setReadme(cached);
      else setReadme("No cached content. Reload the page to fetch the README.");
    };

    if (navType === "reload") {
      fetch(`/api/readme?url=${encodeURIComponent(RAW_URL)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          const text = await res.text();
          localStorage.setItem(storageKey, text);
          setReadme(text);
        })
        .catch((err) => setReadme(`Error fetching README: ${String(err)}`));
    } else {
      loadFromLocal();
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold">Frontend Resources</h1>
        <p className="text-sm text-muted-foreground">
          Source repo:{" "}
          <a
            href="https://github.com/Aditya-Dawadikar/FrontEnd_Engneer_2025"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Aditya-Dawadikar/FrontEnd_Engneer_2025
          </a>
        </p>
      </div>

      <article className="prose prose-lg dark:prose-invert bg-panel p-6 rounded">
        {readme ? (
          <ReactMarkdown components={globalComponents}>{readme}</ReactMarkdown>
        ) : (
          <p>Loading...</p>
        )}
      </article>
    </div>
  );
}

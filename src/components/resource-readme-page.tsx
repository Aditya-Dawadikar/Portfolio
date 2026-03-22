"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { globalComponents } from "@/components/mdx";

type ResourceReadmePageProps = {
  title: string;
  rawUrl: string;
  sourceRepoUrl: string;
  sourceRepoLabel: string;
};

function isAbsoluteOrAnchorUrl(url: string): boolean {
  return !url || url.startsWith("#") || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url);
}

function resolveMarkdownUrl(url: string, baseUrl: string): string {
  const trimmed = url.trim();

  if (isAbsoluteOrAnchorUrl(trimmed)) {
    return trimmed;
  }

  const normalized = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  return new URL(normalized, baseUrl).toString();
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function inferBaseUrls(rawUrl: string, sourceRepoUrl: string): { rawBaseUrl: string; repoBaseUrl: string } {
  const rawBaseUrl = rawUrl.slice(0, rawUrl.lastIndexOf("/") + 1);

  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname === "raw.githubusercontent.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 4) {
        const owner = parts[0];
        const repo = parts[1];
        const branch = parts[2];
        const pathParts = parts.slice(3);
        const dirParts = pathParts.slice(0, -1);
        const dirPath = dirParts.length > 0 ? `${dirParts.join("/")}/` : "";

        return {
          rawBaseUrl,
          repoBaseUrl: `https://github.com/${owner}/${repo}/blob/${branch}/${dirPath}`,
        };
      }
    }
  } catch {
    // Fall back when URL parsing fails.
  }

  return {
    rawBaseUrl,
    repoBaseUrl: `${stripTrailingSlash(sourceRepoUrl)}/blob/master/`,
  };
}

export default function ResourceReadmePage({
  title,
  rawUrl,
  sourceRepoUrl,
  sourceRepoLabel,
}: ResourceReadmePageProps) {
  const [readme, setReadme] = useState<string | null>(null);
  const storageKey = `readme:${rawUrl}`;

  const { rawBaseUrl, repoBaseUrl } = useMemo(
    () => inferBaseUrls(rawUrl, sourceRepoUrl),
    [rawUrl, sourceRepoUrl]
  );

  const markdownComponents = useMemo(
    () => ({
      ...globalComponents,
      a: (props: any) => {
        const originalHref = typeof props.href === "string" ? props.href : "";
        const href = resolveMarkdownUrl(originalHref, repoBaseUrl);

        if (href.startsWith("#")) {
          return <a {...props} href={href} />;
        }

        return <a {...props} href={href} target="_blank" rel="noopener noreferrer" />;
      },
      img: (props: any) => {
        const src =
          typeof props.src === "string" ? resolveMarkdownUrl(props.src, rawBaseUrl) : props.src;
        return <img {...props} src={src} alt={props.alt ?? ""} loading="lazy" />;
      },
    }),
    [rawBaseUrl, repoBaseUrl]
  );

  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    const navType = navEntries.length
      ? navEntries[0].type
      : (performance as any).navigation?.type === 1
        ? "reload"
        : "navigate";

    const fetchReadme = () => {
      fetch(`/api/readme?url=${encodeURIComponent(rawUrl)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          const text = await res.text();
          localStorage.setItem(storageKey, text);
          setReadme(text);
        })
        .catch((err) => setReadme(`Error fetching README: ${String(err)}`));
    };

    if (navType === "reload") {
      // Always fetch on full page reload.
      fetchReadme();
    } else {
      // On client-side navigation, check cache first.
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setReadme(cached);
      } else {
        fetchReadme();
      }
    }
  }, [rawUrl, storageKey]);

  return (
    <div className="max-w-3xl mx-auto py-8 mt-4 md:mt-0">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-zinc-100">{title}</h1>
        <p className="text-sm text-zinc-300">
          Source repo:{" "}
          <a
            href={sourceRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-zinc-100 hover:text-white"
          >
            {sourceRepoLabel}
          </a>
        </p>
      </div>

      <article className="prose prose-lg max-w-none rounded-2xl border border-white/10 bg-black/50 p-6 text-zinc-300 prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-li:text-zinc-300 prose-a:text-zinc-100 prose-code:text-zinc-100 prose-pre:bg-black/70">
        {readme ? (
          <ReactMarkdown components={markdownComponents as any}>{readme}</ReactMarkdown>
        ) : (
          <p className="text-zinc-300">Loading...</p>
        )}
      </article>
    </div>
  );
}

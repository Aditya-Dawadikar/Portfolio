import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowLeft, Map as MapIcon } from "lucide-react";
import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-wm-display",
});

export const metadata: Metadata = {
  title: "Atlas Field Guide",
  description: "A field guide to the Marble Atlas: its palette, terrain, territories, settlements, landmarks and signs.",
};

/** The guide is src/world-map/README.md; its plates live in public/atlas/guide (pnpm atlas:guide). */
const README = path.join(process.cwd(), "src", "world-map", "README.md");
const PUBLIC = path.join(process.cwd(), "public");

/** README image paths are relative to the file (so they also work on GitHub); serve them from /public. */
const publicUrl = (src: string) => src.replace(/^(\.\.\/)*public\//, "/");

/** Plates are rendered at 2× pixel density; read their size from the PNG header. */
function plateSize(url: string): { width: number; height: number } | null {
  try {
    const header = Buffer.alloc(24);
    const fd = fs.openSync(path.join(PUBLIC, url), "r");
    fs.readSync(fd, header, 0, 24, 0);
    fs.closeSync(fd);
    return { width: Math.round(header.readUInt32BE(16) / 2), height: Math.round(header.readUInt32BE(20) / 2) };
  } catch {
    return null;
  }
}

const textOf = (node: ReactNode): string =>
  typeof node === "string" || typeof node === "number"
    ? String(node)
    : Array.isArray(node)
      ? node.map(textOf).join("")
      : node && typeof node === "object" && "props" in node
        ? textOf((node as { props: { children?: ReactNode } }).props.children)
        : "";

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-[family-name:var(--font-wm-display)] text-[44px] font-semibold uppercase leading-none tracking-[0.14em] text-[#f2ede2] sm:text-[60px]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2
      id={slug(textOf(children))}
      className="mt-20 scroll-mt-20 border-t border-[#a87d45]/35 pt-8 font-[family-name:var(--font-wm-display)] text-[30px] font-semibold uppercase tracking-[0.16em] text-[#f2ede2]"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-12 font-[family-name:var(--font-wm-display)] text-[23px] font-semibold tracking-[0.04em] text-[#e2c89c]">{children}</h3>
  ),
  p: ({ children }) => <p className="mt-4 max-w-[68ch] text-[15px] leading-[1.75] text-[#cfc8bb]">{children}</p>,
  em: ({ children }) => <em className="font-[family-name:var(--font-wm-display)] text-[21px] italic text-[#c49a5e]">{children}</em>,
  strong: ({ children }) => <strong className="font-semibold text-[#f2ede2]">{children}</strong>,
  code: ({ children }) => <code className="whitespace-nowrap font-mono text-[11px] text-[#a59e92]">{children}</code>,
  hr: () => (
    <div aria-hidden className="mt-16 flex items-center gap-4 text-[#a87d45]/60">
      <span className="h-px flex-1 bg-[#a87d45]/25" />
      <span className="text-[11px]">✦</span>
      <span className="h-px flex-1 bg-[#a87d45]/25" />
    </div>
  ),
  img: ({ src = "", alt = "" }) => {
    const url = publicUrl(src);
    const size = plateSize(url);
    const swatch = url.includes("/swatch-");
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        width={size?.width}
        height={size?.height}
        loading="lazy"
        className={swatch ? "inline-block h-7 w-7" : "my-2 inline-block h-auto max-w-full rounded-[4px] shadow-[0_0_0_1px_rgba(242,237,226,0.12),0_18px_40px_-20px_rgba(0,0,0,0.9)]"}
      />
    );
  },
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[14px] leading-relaxed text-[#cfc8bb]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-[#a87d45]/35 pb-2 pr-5 text-[10px] font-normal uppercase tracking-[0.2em] text-[#c49a5e]">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-[#f2ede2]/[0.07] py-3 pr-5 align-middle">{children}</td>,
  a: ({ href, children }) => (
    <a href={href} className="text-[#e2c89c] underline decoration-[#a87d45]/50 underline-offset-4 hover:text-[#f2ede2]">
      {children}
    </a>
  ),
};

export default function Page() {
  const markdown = fs.readFileSync(README, "utf8");
  const sections = Array.from(markdown.matchAll(/^## (.+)$/gm), (m) => m[1].trim());

  return (
    <div className={`${display.variable} min-h-[100dvh] bg-[#070d17] text-[#f2ede2]`}>
      <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-3 border-b border-[#f2ede2]/10 bg-[#070d17]/90 px-4 backdrop-blur">
        <Link href="/atlas" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#a59e92] hover:text-[#e2c89c]">
          <ArrowLeft className="h-3.5 w-3.5" /> Atlas
        </Link>
        <span className="font-[family-name:var(--font-wm-display)] text-[17px] font-semibold uppercase tracking-[0.18em]">Field Guide</span>
        <Link href="/atlas" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#a59e92] hover:text-[#e2c89c]">
          <MapIcon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Open the map</span>
        </Link>
      </header>

      <div className="mx-auto flex max-w-[1180px] gap-14 px-4 pb-32 pt-14 sm:px-8">
        <nav aria-label="Guide sections" className="sticky top-24 hidden h-fit w-[190px] shrink-0 lg:block">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#c49a5e]">Contents</p>
          <ol className="mt-4 space-y-2.5 border-l border-[#a87d45]/30 pl-4">
            {sections.map((s) => (
              <li key={s}>
                <a href={`#${slug(s)}`} className="font-[family-name:var(--font-wm-display)] text-[16px] text-[#a59e92] transition-colors hover:text-[#f2ede2]">
                  {s}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="min-w-0 max-w-[860px] flex-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {markdown}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

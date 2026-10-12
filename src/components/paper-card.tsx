"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function PdfPreview({ title, pdf, onClose }: { title: string; pdf: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // Portaled to <body>: the page card uses backdrop-blur, which would otherwise trap `position: fixed`.
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} (PDF preview)`}
    >
      <div
        className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <p className="min-w-0 flex-1 truncate text-sm text-zinc-100">{title}</p>
          <a
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Open PDF in a new tab"
            title="Open in new tab"
          >
            <ExternalLink className="size-4" />
          </a>
          <a
            href={pdf}
            download
            className="rounded-full p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Download PDF"
            title="Download"
          >
            <Download className="size-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close preview"
            autoFocus
          >
            <X className="size-4" />
          </button>
        </div>
        <iframe src={pdf} title={title} className="w-full flex-1 bg-white" />
      </div>
    </div>,
    document.body,
  );
}

export function PaperCard({
  title,
  authors,
  venue,
  date,
  description,
  links,
  pdf,
  image,
}: {
  title: string;
  authors: string;
  venue: string;
  date: string;
  description?: string;
  links: Array<{
    type: string;
    href: string;
    icon: React.ReactNode;
  }>;
  pdf?: string;
  image?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = () => pdf && setIsPreviewOpen(true);

  return (
    <>
      <Card
        className={`flex h-full flex-col overflow-hidden border border-white/15 bg-black/45 text-zinc-100 transition-all duration-300 ease-out hover:shadow-lg ${
          pdf ? "cursor-pointer hover:border-white/35" : ""
        }`}
        onClick={openPreview}
        onKeyDown={(e) => {
          if (pdf && e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openPreview();
          }
        }}
        role={pdf ? "button" : undefined}
        tabIndex={pdf ? 0 : undefined}
        aria-label={pdf ? `Preview ${title}` : undefined}
      >
        {image && (
          <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-white/10 bg-white">
            <Image
              src={image}
              alt={`Key figure from ${title}`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover object-top"
            />
          </div>
        )}
        <CardHeader className="px-2">
          <div className="space-y-1">
            <CardTitle className="mt-1 text-base text-zinc-100">{title}</CardTitle>
            <p className="text-xs text-zinc-300">{authors}</p>
            <p className="text-xs text-zinc-300">{venue}</p>
            <time className="text-xs text-zinc-400">{date}</time>
          </div>
        </CardHeader>
        {description && (
          <CardContent className="px-2 text-pretty text-xs text-zinc-300">
            <p className={!isExpanded ? "line-clamp-1" : ""}>
              Description: {description}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="cursor-pointer text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:underline"
            >
              {isExpanded ? "Show less" : "Read more..."}
            </button>
          </CardContent>
        )}
        <CardFooter className="mt-auto px-2 pb-2">
          <div className="flex flex-row flex-wrap items-start gap-1">
            {pdf && (
              <Badge className="flex gap-2 px-2 py-1 text-[10px]">
                <FileText className="size-3" />
                Preview PDF
              </Badge>
            )}
            {links?.map((link, idx) => (
              <Link href={link?.href} key={idx} target="_blank" onClick={(e) => e.stopPropagation()}>
                <Badge className="flex gap-2 px-2 py-1 text-[10px]">
                  {link.icon}
                  {link.type}
                </Badge>
              </Link>
            ))}
          </div>
        </CardFooter>
      </Card>
      {isPreviewOpen && pdf && (
        <PdfPreview title={title} pdf={pdf} onClose={() => setIsPreviewOpen(false)} />
      )}
    </>
  );
}

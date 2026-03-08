"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";

export function PaperCard({
  title,
  authors,
  venue,
  date,
  description,
  links,
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
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="flex h-full flex-col overflow-hidden border border-white/15 bg-black/45 text-zinc-100 transition-all duration-300 ease-out hover:shadow-lg">
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
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:underline"
          >
            {isExpanded ? "Show less" : "Read more..."}
          </button>
        </CardContent>
      )}
      <CardFooter className="mt-auto px-2 pb-2">
        {links && links.length > 0 && (
          <div className="flex flex-row flex-wrap items-start gap-1">
            {links?.map((link, idx) => (
              <Link href={link?.href} key={idx} target="_blank">
                <Badge key={idx} className="flex gap-2 px-2 py-1 text-[10px]">
                  {link.icon}
                  {link.type}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

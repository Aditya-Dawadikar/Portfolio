import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type Props = {
  title: string;
  href: string;
  date?: string;
  /** Medium tags; the first few are shown. */
  tags?: string[];
  className?: string;
};

export default function BlogCard({ title, href, date, tags = [], className }: Props) {
  return (
    <Card className={`flex h-full flex-col overflow-hidden border border-white/15 bg-black/45 text-zinc-100 transition-all duration-300 ease-out hover:shadow-lg ${className ?? ""}`}>
      <CardHeader className="px-2">
        <div className="space-y-1">
          <CardTitle className="mt-1 text-base">
            <Link href={href} target="_blank" className="text-zinc-100 hover:underline">
              {title}
            </Link>
          </CardTitle>
          {date && <time className="text-xs text-zinc-400">{date}</time>}
        </div>
      </CardHeader>

      <CardFooter className="px-2 pb-2 mt-auto">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={href} target="_blank">
            <Badge className="px-2 py-1 text-[10px]">Read on Medium</Badge>
          </Link>
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} className="border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-zinc-300">
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

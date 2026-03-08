import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type Props = {
  title: string;
  href: string;
  date?: string;
  category?: "project" | "knowledge";
  className?: string;
};

export default function BlogCard({ title, href, date, category, className }: Props) {
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
        <div className="flex items-center gap-2">
          <Link href={href} target="_blank">
            <Badge className="px-2 py-1 text-[10px]">Read on Medium</Badge>
          </Link>
          {category && (
            <Badge
              className={`px-2 py-1 text-[10px] ${
                category === "project"
                  ? "border border-blue-400/30 bg-blue-500/20 text-blue-200"
                  : "border border-emerald-400/30 bg-emerald-500/20 text-emerald-200"
              }`}
            >
              {category === "project" ? "Project" : "Knowledge"}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

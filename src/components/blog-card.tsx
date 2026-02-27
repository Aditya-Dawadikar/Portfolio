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
    <Card className={`flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full ${className ?? ""}`}>
      <CardHeader className="px-2">
        <div className="space-y-1">
          <CardTitle className="mt-1 text-base">
            <Link href={href} target="_blank" className="hover:underline">
              {title}
            </Link>
          </CardTitle>
          {date && <time className="font-sans text-xs">{date}</time>}
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
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
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

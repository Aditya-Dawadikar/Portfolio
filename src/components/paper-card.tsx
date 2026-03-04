import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

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
  return (
    <Card className="flex flex-col overflow-hidden border hover:shadow-lg transition-shadow p-3">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-xs font-medium">{authors}</CardDescription>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs">
              {venue}
            </Badge>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
        </div>
      </CardHeader>
      {description && (
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        </CardContent>
      )}
      <CardContent className="pt-0">
        <div className="flex gap-2 flex-wrap">
          {links.map((link) => (
            <Link
              key={link.type}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium hover:bg-muted transition-colors"
            >
              {link.icon}
              <span>{link.type}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

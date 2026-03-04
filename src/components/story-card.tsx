import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StoryCard({
  title,
  company,
  date,
  description,
  tags,
}: {
  title: string;
  company: string;
  date: string;
  description: string;
  tags?: string[];
}) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-xs font-medium">{company}</CardDescription>
          <div className="text-xs text-muted-foreground">{date}</div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

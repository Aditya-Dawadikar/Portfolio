"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="flex flex-col overflow-hidden border hover:shadow-lg transition-shadow p-3">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-xs font-medium">{company}</CardDescription>
          <div className="text-xs text-muted-foreground">{date}</div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p 
          className={`text-sm text-muted-foreground leading-relaxed ${
            isExpanded ? "" : "line-clamp-3"
          }`}
        >
          {description}
        </p>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-auto py-1 text-xs font-medium"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </Button>
      </CardContent>
    </Card>
  );
}

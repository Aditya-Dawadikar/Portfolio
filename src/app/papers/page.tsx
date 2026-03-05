import { DATA } from "@/data/resume";
import { PaperCard } from "@/components/paper-card";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Papers",
  description: "Published papers and research.",
};

export default function Page() {
  const sortedPapers = [...(DATA.papers || [])]
    .sort((a:any, b:any) => {
      const dateA = new Date(a.date || "0").getTime();
      const dateB = new Date(b.date || "0").getTime();
      return dateB - dateA;
    });

  return (
    <div className="space-y-6 mt-4 md:mt-0">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Published Papers</h1>
        <div className="flex gap-2 flex-wrap">
          {DATA.scholarProfiles?.googleScholar && (
            <Link
              href={DATA.scholarProfiles.googleScholar}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge className="flex gap-2 px-3 py-2 text-xs">
                <Icons.googleScholar className="size-4" />
                Google Scholar
              </Badge>
            </Link>
          )}
          {DATA.scholarProfiles?.orcid && (
            <Link
              href={DATA.scholarProfiles.orcid}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Badge className="flex gap-2 px-3 py-2 text-xs">
                <Icons.orcid className="size-4" />
                ORCID
              </Badge>
            </Link>
          )}
        </div>
      </div>
      {sortedPapers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Work In Progress, Coming Soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sortedPapers.map((paper:any) => (
            <PaperCard
              key={paper.title}
              title={paper.title}
              authors={paper.authors}
              venue={paper.venue}
              date={paper.date}
              description={paper.description}
              links={paper.links}
            />
          ))}
        </div>
      )}
    </div>
  );
}

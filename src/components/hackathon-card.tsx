import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Props {
  title: string;
  description: string;
  dates: string;
  location: string;
  image?: string;
  links?: readonly {
    icon: React.ReactNode;
    title: string;
    href: string;
  }[];
  result?: string;
}

export function HackathonCard({
  title,
  description,
  dates,
  location,
  image,
  links,
  result,
}: Props) {
  const extractMonthYear = (s?: string) => {
    if (!s) return { month: "", year: "" };
    const yearMatch = s.match(/(20\d{2}|19\d{2})/);
    const monthMatch = s.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
    const year = yearMatch ? yearMatch[0] : "";
    let month = "";
    if (monthMatch) {
      month = monthMatch[0];
    } else {
      // fallback: take first token
      month = (s.split(/[,\s]+/)[0] || "");
    }
    return { month, year };
  };
  const { month, year } = extractMonthYear(dates);
  return (
    <li className="relative ml-36 py-4">
      <div className="absolute -left-36 top-2 flex items-start justify-center">
        <div className="flex items-start">
          <div className="flex flex-col items-center mr-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 mx-2 my-1" />
            {/* <div className="w-px h-24 bg-border mt-2"></div> */}
          </div>
          <div className="flex flex-col text-left">
            <div className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-200 break-words leading-tight">
              {month}
            </div>
            <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300">
              {year}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-start gap-1">
        {/* date shown on timeline */}
        <h2 className="font-semibold leading-none">{title}</h2>
        {location && (
          <p className="text-sm text-muted-foreground">{location}</p>
        )}
        {description && (
          <span className="prose dark:prose-invert text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-row flex-wrap items-start gap-2">
        {links && links.length > 0 &&
          links.map((link, idx) => (
            <Link href={link.href} key={idx}>
              <Badge key={idx} title={link.title} className="flex gap-2">
                {link.icon}
                {link.title}
              </Badge>
            </Link>
          ))}

        {/* Result badge (participant / winner) shown next to source badge or alone */}
        {result === "winner" ? (
          <Badge className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 text-black shadow-md">
            ⭐ Winner
          </Badge>
        ) : result === "participant" ? (
          <Badge className="bg-slate-100 text-slate-800">Participant</Badge>
        ) : null}
      </div>
    </li>
  );
}

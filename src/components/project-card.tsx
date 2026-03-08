import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Markdown from "react-markdown";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  embed?: string;
  team?: boolean;
  hackathonWinner?: boolean;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  link,
  image,
  video,
  embed,
  team,
  hackathonWinner,
  links,
  className,
}: Props) {
  const descriptionToggleId = `project-desc-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}-${dates.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden border border-white/15 bg-black/45 p-2 text-zinc-100 transition-all duration-300 ease-out hover:shadow-lg",
        className,
      )}
    >
      <Link
        href={href || "#"}
        target="_blank"
        className="block cursor-pointer"
      >
        {embed ? (
          <div className="mx-auto w-full overflow-hidden rounded aspect-video">
            <iframe
              src={embed}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
              allowFullScreen
              scrolling="no"
              title={title + " embed"}
            />
          </div>
        ) : video ? (
          // If `video` is a YouTube/embed URL render an iframe, otherwise render native video
          /(youtube|youtu\.be|youtube-nocookie)\/|youtube\.com\/embed/.test(video) ? (
            <div className="mx-auto w-full overflow-hidden rounded aspect-video">
              {(() => {
                let iframeSrc = video;
                try {
                  const u = new URL(video);
                  u.searchParams.set("autoplay", "1");
                  u.searchParams.set("mute", "1");
                  iframeSrc = u.toString();
                } catch (e) {
                  iframeSrc = video + (video.includes("?") ? "&autoplay=1&mute=1" : "?autoplay=1&mute=1");
                }
                return (
                  <iframe
                    src={iframeSrc}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                    allowFullScreen
                    scrolling="no"
                    title={title + " video"}
                  />
                );
              })()}
            </div>
          ) : (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="pointer-events-none mx-auto h-auto w-full rounded"
            />
          )
        ) : image ? (
          <img
            src={image}
            alt={title}
            className="h-auto w-full rounded"
            loading="lazy"
          />
        ) : null}
      </Link>
      <CardHeader className="px-2 py-2">
        <div className="space-y-1">
          <CardTitle className="mt-1 text-base text-zinc-100">{title}</CardTitle>
          <time className="text-xs text-zinc-400">{dates}</time>
          <div className="hidden font-sans text-xs underline print:visible">
            {link?.replace("https://", "").replace("www.", "").replace("/", "")}
          </div>

          <input id={descriptionToggleId} type="checkbox" className="peer sr-only" />
          <div className="relative max-h-16 overflow-hidden text-pretty text-xs text-zinc-300 transition-all duration-300 peer-checked:max-h-96">
            <Markdown className="prose prose-sm max-w-full text-zinc-300 prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-a:text-zinc-100">
              {description}
            </Markdown>
          </div>

          <label
            htmlFor={descriptionToggleId}
            className="inline-flex cursor-pointer select-none text-xs font-medium text-zinc-300 underline underline-offset-2 hover:text-zinc-100 peer-checked:hidden"
          >
            Read more
          </label>
          <label
            htmlFor={descriptionToggleId}
            className="hidden cursor-pointer select-none text-xs font-medium text-zinc-300 underline underline-offset-2 hover:text-zinc-100 peer-checked:inline-flex"
          >
            Read less
          </label>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-2 py-2">
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags?.map((tag) => (
              <Badge
                className="px-1 py-0 text-[10px]"
                variant="secondary"
                key={tag}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-2 pb-2 pt-0">
        <div className="flex flex-row flex-wrap items-start gap-1">
          {links && links.length > 0 && (
            <>
              {links?.map((link, idx) => (
                <Link href={link?.href} key={idx} target="_blank">
                  <Badge key={idx} className="flex gap-2 px-2 py-1 text-[10px]">
                    {link.icon}
                    {link.type}
                  </Badge>
                </Link>
              ))}
            </>
          )}
          {team !== undefined && (
            <Badge variant={team ? "default" : "secondary"} className="text-[10px] px-2 py-1">
              {team ? "Team" : "Solo"}
            </Badge>
          )}
          {hackathonWinner && (
            <Badge className="text-[10px] px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white">
              🏆 Winner
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

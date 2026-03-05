import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
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
  return (
    <Card
      className={
        "flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full"
      }
    >
      <Link
        href={href || "#"}
        target="_blank"
        className={cn("block cursor-pointer", className)}
      >
        {embed ? (
          <div className="mx-auto h-40 w-full overflow-hidden rounded">
            <iframe
              src={embed}
              className="h-40 w-full scale-100 origin-top-left"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
              allowFullScreen
              scrolling="no"
              title={title + " embed"}
            />
          </div>
        ) : video ? (
          // If `video` is a YouTube/embed URL render an iframe, otherwise render native video
          /(youtube|youtu\.be|youtube-nocookie)\/|youtube\.com\/embed/.test(video) ? (
            <div className="mx-auto h-40 w-full overflow-hidden rounded">
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
                    className="h-40 w-full scale-100 origin-top-left"
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
              className="pointer-events-none mx-auto h-40 w-full object-cover object-top"
            />
          )
        ) : image ? (
          <Image
            src={image}
            alt={title}
            width={500}
            height={300}
            unoptimized={true}
            className="h-40 w-full overflow-hidden object-cover object-top"
          />
        ) : null}
      </Link>
      <CardHeader className="px-2">
        <div className="space-y-1">
          <CardTitle className="mt-1 text-base">{title}</CardTitle>
          <time className="font-sans text-xs">{dates}</time>
          <div className="hidden font-sans text-xs underline print:visible">
            {link?.replace("https://", "").replace("www.", "").replace("/", "")}
          </div>
          <Markdown className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
            {description}
          </Markdown>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-2">
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
      <CardFooter className="px-2 pb-2">
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

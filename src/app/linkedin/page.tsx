import Link from "next/link";
import { DATA } from "@/data/resume";

export const metadata = {
  title: "LinkedIn Posts",
  description: "My recent posts on LinkedIn.",
};

export default function Page() {
  // SociableKit widget URL, kept in the environment so the widget can be swapped without a code change.
  const widgetUrl = process.env.LINKEDIN_POSTS_WIDGET_URL;

  return (
    <div className="mt-4 space-y-6 md:mt-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">LinkedIn Posts</h1>
        <Link
          href={DATA.contact.social.LinkedIn.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm uppercase tracking-[0.2em] text-zinc-300 underline-offset-4 hover:text-white hover:underline"
        >
          Follow on LinkedIn
        </Link>
      </div>

      {widgetUrl ? (
        <iframe
          src={widgetUrl}
          title="My LinkedIn posts"
          loading="lazy"
          className="h-[80vh] w-full rounded-2xl border border-white/10 bg-white"
        />
      ) : (
        <p className="text-zinc-400">
          The posts feed isn&apos;t configured. Read them on{" "}
          <Link href={DATA.contact.social.LinkedIn.url} target="_blank" rel="noopener noreferrer" className="underline">
            LinkedIn
          </Link>
          .
        </p>
      )}
    </div>
  );
}

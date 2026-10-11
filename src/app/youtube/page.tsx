export const metadata = {
  title: "YouTube",
  description: "Videos from my YouTube channel.",
};

export default function Page() {
  // Elfsight widget URL, kept in the environment so the widget can be swapped without a code change.
  const widgetUrl = process.env.YOUTUBE_WIDGET_URL;

  return (
    <div className="mt-4 space-y-6 md:mt-0">
      <h1 className="text-3xl font-bold">YouTube</h1>

      {widgetUrl ? (
        <iframe
          src={widgetUrl}
          title="My YouTube channel"
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="h-[80vh] w-full rounded-2xl border border-white/10 bg-white"
        />
      ) : (
        <p className="text-zinc-400">The YouTube feed isn&apos;t configured yet.</p>
      )}
    </div>
  );
}

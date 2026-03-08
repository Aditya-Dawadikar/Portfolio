import Link from "next/link";

export default function FeatureCard({
  title,
  description,
  href,
  children,
  backgroundImage,
}: {
  title: string;
  description?: string;
  href: string;
  children?: React.ReactNode;
  backgroundImage?: string;
}) {
  return (
    <Link href={href} className="block">
      <div 
        className="flex h-full flex-col justify-between rounded-lg border border-white/15 bg-black/45 p-5 text-zinc-100 transition-shadow hover:shadow-lg"
        style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'right center',
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'no-repeat'
        } : undefined}
      >
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            {children}
          </div>
          {description && <p className="mt-2 text-sm text-zinc-300">{description}</p>}
        </div>
        <div className="mt-4 text-sm text-zinc-100 underline">Explore</div>
      </div>
    </Link>
  );
}

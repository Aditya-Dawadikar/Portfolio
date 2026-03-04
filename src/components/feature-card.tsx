import Link from "next/link";

export default function FeatureCard({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description?: string;
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} className="block">
      <div className="flex h-full flex-col justify-between rounded-lg border p-5 hover:shadow-lg transition-shadow">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            {children}
          </div>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="mt-4 text-sm text-blue-600 underline">Explore</div>
      </div>
    </Link>
  );
}

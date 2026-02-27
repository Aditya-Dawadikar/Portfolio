import BlogCard from "@/components/blog-card";
import BLOG_LINKS from "@/data/blog-links";

export const metadata = {
  title: "Blog",
  description: "External blog posts and Medium articles.",
};

export default function BlogPage() {
  return (
    <main className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-6 text-3xl font-semibold">Blogs</h1>
        {BLOG_LINKS.length === 0 ? (
          <p className="text-sm text-muted-foreground">No external blog links yet. Add Medium URLs to <code>src/data/blog-links.ts</code>.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BLOG_LINKS.slice()
              .sort((a, b) => {
                const da = a.date ? new Date(a.date) : new Date(0);
                const db = b.date ? new Date(b.date) : new Date(0);
                return db.getTime() - da.getTime();
              })
              .map((b) => (
                <BlogCard key={b.href} title={b.title} href={b.href} date={b.date} category={b.category} />
              ))}
          </div>
        )}
      </div>
    </main>
  );
}
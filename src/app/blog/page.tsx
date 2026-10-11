import BlogCard from "@/components/blog-card";
import { getBlogPosts } from "@/lib/medium";

export const metadata = {
  title: "Blog",
  description: "External blog posts and Medium articles.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="py-8 mt-4 md:mt-0">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-6 text-3xl font-semibold">Blogs</h1>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet. They load from the Medium RSS feed.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <BlogCard key={post.href} title={post.title} href={post.href} date={post.date} tags={post.tags} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

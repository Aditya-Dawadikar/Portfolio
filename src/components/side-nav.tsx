import Link from "next/link";

export default function SideNav() {
  return (
    <aside className="hidden md:block w-60 shrink-0">
      <nav className="sticky top-24 rounded-2xl border border-white/15 bg-black/45 p-3 backdrop-blur-md">
        <ul className="flex flex-col">
          <li>
            <Link href="/" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white">
              Landing
            </Link>
          </li>
          <li>
            <Link href="/home" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white">
              Home
            </Link>
          </li>
          <li>
            <Link href="/skills" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white">
              Skills
            </Link>
          </li>
          <li>
            <Link href="/projects" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/hackathons" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white">
              Hackathons
            </Link>
          </li>
          <li>
            <Link href="/blog" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white">
              Blogs
            </Link>
          </li>
          <li>
            <Link href="/papers" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white">
              Research Publication
            </Link>
          </li>
          <li>
            <Link href="/stories" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-white/25 hover:text-white">
              Stories
            </Link>
          </li>
          <li className="mt-1 px-3 py-2">
            <div className="mb-2 text-[11px] uppercase tracking-[0.28em] text-zinc-400">Resources</div>
            <ul className="flex flex-col ml-2">
              <li>
                <Link href="/system-design-library" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/25 hover:text-white">
                  System Design
                </Link>
              </li>
              <li>
                <Link href="/frontend-resources" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/25 hover:text-white">
                  Frontend Engineering
                </Link>
              </li>
              <li>
                <Link href="/ai-engineering" className="block rounded-lg border border-transparent px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300 transition-colors hover:border-white/25 hover:text-white">
                  AI Engineering
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

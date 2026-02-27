import Link from "next/link";

export default function SideNav() {
  return (
    <aside className="hidden md:block w-56 pr-6">
      <nav className="sticky top-24 space-y-3">
        <ul className="flex flex-col">
          <li>
            <Link href="/" className="block px-3 py-2 rounded hover:bg-muted">
              Home
            </Link>
          </li>
          <li>
            <Link href="/skills" className="block px-3 py-2 rounded hover:bg-muted">
              Skills
            </Link>
          </li>
          <li>
            <Link href="/projects" className="block px-3 py-2 rounded hover:bg-muted">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/hackathons" className="block px-3 py-2 rounded hover:bg-muted">
              Hackathons
            </Link>
          </li>
          <li>
            <Link href="/blog" className="block px-3 py-2 rounded hover:bg-muted">
              Blogs
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

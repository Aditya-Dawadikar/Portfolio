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
          <li>
            <Link href="/papers" className="block px-3 py-2 rounded hover:bg-muted">
              Research Publication
            </Link>
          </li>
          <li className="px-3 py-2">
            <div className="text-sm font-medium text-black mb-2">Resources</div>
            <ul className="flex flex-col ml-2">
              <li>
                <Link href="/system-design-library" className="block px-3 py-2 rounded hover:bg-muted">
                  System Design
                </Link>
              </li>
              <li>
                <Link href="/frontend-resources" className="block px-3 py-2 rounded hover:bg-muted">
                  Frontend Engineering
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

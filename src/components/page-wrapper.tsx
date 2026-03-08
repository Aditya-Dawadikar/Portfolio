"use client";

import { usePathname } from "next/navigation";
import SideNav from "./side-nav";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
      <div className="flex gap-8">
        <SideNav />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

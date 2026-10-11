import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { buildGitHubWorld, GITHUB_ATLAS_USERNAME } from "@/data/github-atlas";
import { fetchGitHubRepos } from "@/lib/githubRepos";
import { AtlasWorkbench } from "./atlas-workbench";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-wm-display",
});

export const metadata: Metadata = {
  title: "GitHub Atlas",
  description: "Every public GitHub repository, charted as a procedurally generated marble atlas.",
};

export const revalidate = 3600;

export default async function Page() {
  const result = await fetchGitHubRepos(GITHUB_ATLAS_USERNAME);
  const profile = `https://github.com/${GITHUB_ATLAS_USERNAME}`;

  if (result.ok) {
    return (
      <div className={display.variable}>
        <AtlasWorkbench data={buildGitHubWorld(result.repos, result.fetchedAt)} username={GITHUB_ATLAS_USERNAME} />
      </div>
    );
  }

  return (
    <div className={`${display.variable} flex h-[100dvh] flex-col items-center justify-center gap-3 bg-[#070d17] p-8 text-center text-[#f2ede2]`}>
      <p className="font-[family-name:var(--font-wm-display)] text-[24px]">The atlas could not be charted right now.</p>
      <p className="text-[13px] text-[#a59e92]">{result.error}</p>
      <div className="flex gap-4 text-[13px]">
        <Link href="/" className="inline-flex items-center gap-1 text-[#a59e92] hover:text-[#e2c89c]">
          <ArrowLeft className="h-3.5 w-3.5" /> Portfolio
        </Link>
        <a href={profile} target="_blank" rel="noreferrer" className="text-[#e2c89c] underline underline-offset-4">
          Browse the repositories on GitHub instead
        </a>
      </div>
    </div>
  );
}

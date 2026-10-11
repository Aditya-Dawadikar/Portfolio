"use client";

import { useStudyResourcesEnabled } from "@/lib/use-study-resources";

/** Renders its children only while the `study-resources` flag is on. */
export default function StudyResourcesGate({ children }: { children: React.ReactNode }) {
  return useStudyResourcesEnabled() ? <>{children}</> : null;
}

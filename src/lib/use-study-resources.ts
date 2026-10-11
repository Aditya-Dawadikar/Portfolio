"use client";

import { useEffect, useState } from "react";

// Shared across every caller so the nav pieces trigger a single request per page load.
let request: Promise<boolean> | null = null;

function fetchEnabled() {
  request ??= fetch("/api/flags/study-resources")
    .then((res) => (res.ok ? res.json() : { enabled: false }))
    .then((data: { enabled?: boolean }) => data.enabled === true)
    .catch(() => false);
  return request;
}

/** Whether the `study-resources` flag is on. Starts hidden so nothing flashes while the flag is off. */
export function useStudyResourcesEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    fetchEnabled().then((value) => {
      if (active) setEnabled(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return enabled;
}

export const STUDY_RESOURCE_PATHS = new Set([
  "/system-design-library",
  "/frontend-resources",
  "/ai-engineering",
  "/computer-networks-resources",
]);

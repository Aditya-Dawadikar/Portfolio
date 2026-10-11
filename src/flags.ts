import { flag } from "flags/next";
import { vercelAdapter } from "@flags-sdk/vercel";

export const studyResourcesFlag = flag<boolean>({
  key: "study-resources",
  description:
    "Aditya Portfolio study resources page will be controlled using this feature flag",
  defaultValue: true,
  options: [
    { value: false, label: "Off" },
    { value: true, label: "On" },
  ],
  adapter: vercelAdapter,
});

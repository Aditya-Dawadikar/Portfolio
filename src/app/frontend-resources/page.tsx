import { notFound } from "next/navigation";
import ResourceReadmePage from "@/components/resource-readme-page";
import { studyResourcesFlag } from "@/flags";

const RAW_URL =
  "https://raw.githubusercontent.com/Aditya-Dawadikar/FrontEnd_Engneer_2025/master/README.md";

export default async function Page() {
  if (!(await studyResourcesFlag())) notFound();

  return (
    <ResourceReadmePage
      title="Frontend Resources"
      rawUrl={RAW_URL}
      sourceRepoUrl="https://github.com/Aditya-Dawadikar/FrontEnd_Engneer_2025"
      sourceRepoLabel="Aditya-Dawadikar/FrontEnd_Engneer_2025"
    />
  );
}

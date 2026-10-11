import { notFound } from "next/navigation";
import ResourceReadmePage from "@/components/resource-readme-page";
import { studyResourcesFlag } from "@/flags";

const RAW_URL =
  "https://raw.githubusercontent.com/Aditya-Dawadikar/Distributed_Systems_Engineer_2026/master/README.md";

export default async function Page() {
  if (!(await studyResourcesFlag())) notFound();

  return (
    <ResourceReadmePage
      title="System Design Library"
      rawUrl={RAW_URL}
      sourceRepoUrl="https://github.com/Aditya-Dawadikar/Distributed_Systems_Engineer_2026"
      sourceRepoLabel="Aditya-Dawadikar/Distributed_Systems_Engineer_2026"
    />
  );
}

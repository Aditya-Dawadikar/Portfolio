import ResourceReadmePage from "@/components/resource-readme-page";

const RAW_URL =
  "https://raw.githubusercontent.com/Aditya-Dawadikar/AI_Engineer_2026/master/README.md";

export default function Page() {
  return (
    <ResourceReadmePage
      title="AI Engineering"
      rawUrl={RAW_URL}
      sourceRepoUrl="https://github.com/Aditya-Dawadikar/AI_Engineer_2026"
      sourceRepoLabel="Aditya-Dawadikar/AI_Engineer_2026"
    />
  );
}
import ResourceReadmePage from "@/components/resource-readme-page";

const RAW_URL =
  "https://raw.githubusercontent.com/Aditya-Dawadikar/Computer-Networks-InterviewPrep/master/README.md";

export default function Page() {
  return (
    <ResourceReadmePage
      title="Computer Networks Resources"
      rawUrl={RAW_URL}
      sourceRepoUrl="https://github.com/Aditya-Dawadikar/Computer-Networks-InterviewPrep"
      sourceRepoLabel="Aditya-Dawadikar/Computer-Networks-InterviewPrep"
    />
  );
}

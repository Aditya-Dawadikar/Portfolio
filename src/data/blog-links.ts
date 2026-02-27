export type BlogLink = {
  title: string;
  href: string;
  summary?: string;
  image?: string;
  tags?: string[];
  date?: string;
  // 'project' for project discussion posts, 'knowledge' for tutorials/articles
  category?: "project" | "knowledge";
};

export const BLOG_LINKS: BlogLink[] = [
  {
    title: "CellCraft-AI: How I built the POC",
    href: "https://medium.com/@aditya-dawadikar/cellcraft-ai-how-i-built-the-poc-5ee3d8ad029e",
    date: "Jul 6, 2025",
    category: "project",
  },
  {
    title: "CellCraft-AI: From POC to MVP",
    href: "https://medium.com/@aditya-dawadikar/cellcraft-ai-from-poc-to-mvp",
    date: "Jul 6, 2025",
    category: "project",
  },
  {
    title: "CellCraft-AI: Engineering the Context",
    href: "https://medium.com/@aditya-dawadikar/cellcraft-ai-engineering-the-context",
    date: "Jul 7, 2025",
    category: "project",
  },
  {
    title: "CellCraft-AI: The Final Important Bits",
    href: "https://medium.com/@aditya-dawadikar/cellcraft-ai-the-final-important-bits",
    date: "Jul 7, 2025",
    category: "project",
  },
  {
    title: "How I built a Neural Network from Scratch | Part 1: Dense Layer",
    href: "https://medium.com/@aditya-dawadikar/how-i-built-a-neural-network-from-scratch-part-1-dense-layer-43d5b7f39e8b",
    date: "May 22, 2025",
    category: "project",
  },
  {
    title: "How I built a Neural Network from Scratch | Part 2: Activation Layers and Loss Function",
    href: "https://medium.com/@aditya-dawadikar/how-i-built-a-neural-network-from-scratch-part-2-activation-layers-and-loss-function-3d590dda5425",
    date: "May 24, 2025",
    category: "project",
  },
  {
    title: "How I built a Neural Network from Scratch | Part 3: The Model Class and Training Loop",
    href: "https://medium.com/@aditya-dawadikar/how-i-built-a-neural-network-from-scratch-part-3-the-model-class-and-training-loop-09fc4e94db8e",
    date: "May 26, 2025",
    category: "project",
  },
  {
    title: "System Design | Choosing the Right Database | Part 1 — Understanding Workloads",
    href: "https://medium.com/@aditya-dawadikar/system-design-choosing-the-right-database-part-1-understanding-workloads-4c1d42cc7555",
    date: "Mar 1, 2025",
    category: "knowledge",
  },
  {
    title: "System Design | Choosing the Right Database | Part 2 — Handling Structured Data",
    href: "https://medium.com/@aditya-dawadikar/system-design-choosing-the-right-database-part-2-handling-structured-data-8feb71792afa",
    date: "Mar 1, 2025",
    category: "knowledge",
  },
  {
    title: "System Design | Choosing the Right Database | Part 3 — Unstructured Data Introduction",
    href: "https://medium.com/@aditya-dawadikar/system-design-choosing-the-right-database-part-3-unstructured-data-introduction",
    date: "Mar 1, 2025",
    category: "knowledge",
  },
  {
    title: "System Design | Choosing the Right Database | Part 4 — Handling Real-Time Data and Analytics Introduction",
    href: "https://medium.com/@aditya-dawadikar/system-design-choosing-the-right-database-handling-real-time-data-and-analytics-d69a8ecf228f",
    date: "Mar 2, 2025",
    category: "knowledge",
  },
  {
    title: "System Design | Choosing the Right Database | Part 5 — Handling Vector Search Introduction",
    href: "https://medium.com/@aditya-dawadikar/system-design-choosing-the-right-database-handling-vector-search",
    date: "Mar 3, 2025",
    category: "knowledge",
  },
];

export default BLOG_LINKS;

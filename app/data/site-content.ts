export type Metric = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

export type Project = {
  id: string;
  emoji: string;
  title: string;
  image: string;
  description: string;
  highlights: string[];
  stats: { label: string; value: string }[];
};

export const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#tech-stack", label: "Stack" },
  { href: "#edge", label: "Edge" },
];

export const hero = {
  badge: "System Architect // Automation Expert",
  title:
    "I build AI-powered automation systems that replace manual work and scale operations that save teams 10–20 hours/week.",
  description:
    "I specialize in building automation-first systems — combining full-stack development with AI and n8n to eliminate repetitive processes, connect tools, and turn workflows into scalable systems.",
  cta: "Tell me what you want to eliminate — I'll build the system",
};

export const metrics: Metric[] = [
  {
    id: "efficiency",
    label: "Efficiency Gain",
    value: "75%",
    detail: "Reduced manual work",
  },
  {
    id: "throughput",
    label: "Data Throughput",
    value: "10,000+",
    detail: "Records processing automated",
  },
  {
    id: "capacity",
    label: "Capacity Unlock",
    value: "15+ hrs",
    detail: "Saved per week for teams",
  },
  {
    id: "scope",
    label: "System Scope",
    value: "Full-End",
    detail: "Built end-to-end systems",
  },
];

export const services: Service[] = [
  {
    id: "workflows",
    title: "Build AI-powered workflows",
    description:
      "Leverage n8n, APIs, and LLMs to create intelligent automated processes that think and act.",
    tags: ["n8n", "OpenAI", "Claude", "Webhooks", "Automation"],
  },
  {
    id: "fullstack",
    title: "Develop custom full-stack systems",
    description:
      "Build robust platforms with Next.js, modern backends, and scalable database architectures.",
    tags: ["Next.js", "React", "TypeScript", "Node.js", "Drizzle", "PostgreSQL"],
  },
  {
    id: "integrations",
    title: "Integrate third-party tools",
    description:
      "Connect CRMs, social APIs, payment gateways, and legacy systems into a single operational mesh.",
    tags: ["REST API", "Webhooks", "CRM", "Payments", "Social APIs", "Legacy Systems"],
  },
];

export const projects: Project[] = [
  {
    id: "school",
    emoji: "🏫",
    title: "School Management System",
    image: "/school-management-system.webp",
    description:
      "A full-stack operational platform for managing all school processes in one system. Replaced fragmented tools with a single centralized engine.",
    highlights: [
      "Automated scheduling, attendance, & curriculum",
      "Teacher coordination & salary processing",
      "End-to-end financial reporting",
    ],
    stats: [
      { label: "WORKLOAD_RED", value: "~70%" },
      { label: "CONSOLIDATION", value: "100%" },
    ],
  },
  {
    id: "docs",
    emoji: "📄",
    title: "Document Lifecycle System",
    image: "/document-life-cycle.webp",
    description:
      "Digital system for generating, tracking, and archiving business documents. Handles full lifecycle from creation to legal signing.",
    highlights: [
      "Automated contracts & invoice generation",
      "Real-time approval & signing tracking",
      "Structured secure cloud archiving",
    ],
    stats: [
      { label: "MANUAL_HANDLING", value: "0 MS" },
      { label: "STATUS_VIS", value: "LIVE" },
    ],
  },
  {
    id: "content",
    emoji: "🤖",
    title: "AI Content Pipeline",
    image: "/ai-content-pipeline.webp",
    description:
      "An AI-powered automation pipeline built with n8n and APIs for massive-scale content generation and multi-channel distribution.",
    highlights: [
      "Automated text & caption formatting",
      "Multi-platform distribution engine",
      "Analytics tracking & performance feedback",
    ],
    stats: [
      { label: "OUTPUT_SCALE", value: "10X" },
      { label: "MKT_WORKLOAD", value: "MIN" },
    ],
  },
];

export const edgePoints = [
  "I don't just build apps - I automate entire workflows",
  "I focus on ROI, not just code",
  "I combine AI + backend + automation in one system",
  "I think in systems, not features",
];

export const stack = {
  automation: ["n8n", "OpenAI", "Claude", "APIs", "Webhooks"],
  frontend: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "TanStack",
  ],
  backend: ["Node.js", "PostgreSQL", "Drizzle", "Neon", "Vercel"],
};

import type { StaticImageData } from "next/image";
import aiContentPipeline from "@/public/ai-content-pipeline.jpg";
import documentLifeCycle from "@/public/document-life-cycle.jpg";
import heroAtmosphere from "@/public/hero-atmosphere.jpg";
import profilePortrait from "@/public/profile-portrait.jpg";
import schoolManagementSystem from "@/public/school-management-system.jpg";

export const media = {
  heroAtmosphere,
  profilePortrait,
  projects: {
    school: schoolManagementSystem,
    docs: documentLifeCycle,
    content: aiContentPipeline,
  } satisfies Record<string, StaticImageData>,
};

export type ProjectImageId = keyof typeof media.projects;

"use client";

import { useState } from "react";
import { ContactForm } from "@/components/landing/contact-form";
import {
  CtaBanner,
  EdgeSection,
  HeroSection,
  PhilosophySection,
  ProjectsSection,
  ProofSection,
  ServicesSection,
  SiteFooter,
  StackSection,
  TopNav,
} from "@/components/landing/sections";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <TopNav onOpenContact={() => setIsContactOpen(true)} />
      <main>
        <HeroSection onOpenContact={() => setIsContactOpen(true)} />
        <ProofSection />
        <ServicesSection />
        <PhilosophySection />
        <ProjectsSection />
        <EdgeSection />
        <StackSection />
        <CtaBanner onOpenContact={() => setIsContactOpen(true)} />
        <ContactForm isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </main>
      <SiteFooter />
    </>
  );
}

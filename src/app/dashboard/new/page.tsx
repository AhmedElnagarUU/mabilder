import type { Metadata } from "next";
import { CreateSiteWizard } from "@/features/site-creation/components/create-site-wizard";

export const metadata: Metadata = {
  title: "New website",
  description: "Build a brief in four steps and let AI write the first draft.",
};

export default function NewSitePage() {
  return <CreateSiteWizard />;
}

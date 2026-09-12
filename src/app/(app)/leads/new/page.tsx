import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { AddLeadForm } from "@/components/leads/add-lead-form";

export const metadata: Metadata = {
  title: "Add Lead",
};

export default function AddLeadPage() {
  return (
    <div>
      <PageHeader
        title="Add Lead"
        description="Capture a new lead. Qualification scoring runs once AI analysis is enabled."
      />
      <AddLeadForm />
    </div>
  );
}

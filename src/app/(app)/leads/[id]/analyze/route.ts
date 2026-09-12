import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { leadsService, LeadServiceError } from "@/services/leads";
import { analysesService, AnalysisServiceError } from "@/services/analyses";
import { qualifyLead, AiError } from "@/services/ai/gemini";

/**
 * POST /leads/[id]/analyze
 *
 * Runs AI qualification for a lead the user owns, persists the result, updates
 * the lead status, and returns the structured analysis. Runs entirely
 * server-side so the Gemini API key is never exposed.
 */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const leadId = params.id;

  try {
    const lead = await leadsService.getLeadById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const analysis = await qualifyLead(lead);
    await analysesService.saveAnalysis(leadId, analysis);

    // Reflect the new status and dashboard aggregates on next navigation.
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/leads");
    revalidatePath("/dashboard");

    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof AiError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    if (
      error instanceof LeadServiceError ||
      error instanceof AnalysisServiceError
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[POST /leads/[id]/analyze]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

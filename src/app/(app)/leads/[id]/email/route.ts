import { NextResponse } from "next/server";

import { leadsService, LeadServiceError } from "@/services/leads";
import { analysesService, AnalysisServiceError } from "@/services/analyses";
import { generateOutreachEmail, AiError } from "@/services/ai/gemini";

/**
 * POST /leads/[id]/email
 *
 * Generates a personalized follow-up email for a lead the user owns, informed
 * by the lead's latest AI analysis when available. Persists it to the existing
 * `outreach` table and returns { email }. Server-side only (Gemini key stays
 * on the server).
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

    const analysis = await analysesService.getLatestAnalysis(leadId);
    const email = await generateOutreachEmail(lead, analysis);
    await analysesService.saveOutreach(leadId, email);

    return NextResponse.json({ email });
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
    console.error("[POST /leads/[id]/email]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

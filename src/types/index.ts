// UI-facing domain types
export type { Lead, LeadInput, LeadStatus, LeadTemperature } from "./lead";

// Database row types (persistence layer)
export type {
  Database,
  Json,
  LeadRow,
  LeadInsert,
  LeadUpdate,
  LeadAnalysisRow,
  RecommendedActionRow,
  OutreachRow,
  ActivityRow,
} from "./database";

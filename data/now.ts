export type NowData = {
  intro: string;
  updated: string; // shown next to the live dot, e.g. "Nov 2026"
  items: { label: string; value: string }[];
};

export const now: NowData = {
  updated: "Nov 2026",
  intro: "I build AI features that survive production: tested, bounded by consent and deployed, not demoed once.",
  items: [
    { label: "Shipping", value: "AI as a swappable layer: provider chains, fallbacks and consent gates in CanTrack, CotizaIA, Acompaña and Retoma, plus a CLIP vision check." },
    { label: "RAG", value: "Retrieval with evals in CotizaIA: a pgvector memory, cited estimates, and 55% lower error than a fixed catalog." },
    { label: "Cloud", value: "AWS as code: a Terraform landing zone with multi-region CloudTrail, KMS, alarms and no SSH." },
    { label: "Agents", value: "Building with Claude Code and opencode, and learning MCP so agents call real tools behind approval gates." },
  ],
};

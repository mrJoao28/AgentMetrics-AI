import type { EvaluationMetrics, EvaluationRecord } from "./evaluation-store";
export async function reproducibilityManifest(records: EvaluationRecord[], metrics: EvaluationMetrics, agentName: string) {
  const bytes=new TextEncoder().encode(records.map(r=>JSON.stringify(r)).join("\n"));
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  const sha256=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
  return {schema_version:"1.0",generated_at:new Date().toISOString(),agent_name:agentName,dataset_sha256:sha256,record_count:records.length,
    evaluator:"agentmetrics-ai",method:"trim + casefold exact match",metrics,records_format:"jsonl",warning:"latency and cost are supplied, not independently measured"};
}
export function exportJsonReport(manifest: Record<string,unknown>, records: EvaluationRecord[]) {
  return JSON.stringify({manifest,records},null,2);
}
export function exportCsvReport(records: EvaluationRecord[]) {
  const escape=(s:unknown)=>{const raw=String(s??"");const safe=/^\s*[=+@-]/.test(raw)? "'" + raw : raw;return '"' + safe.replaceAll('"','""') + '"';};
  return ["expected,predicted,latency_ms,cost_usd",...records.map(r=>[r.expected,r.predicted,r.latency_ms,r.cost_usd??0].map(escape).join(","))].join("\r\n");
}

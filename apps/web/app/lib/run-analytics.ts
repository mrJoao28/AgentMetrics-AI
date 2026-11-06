import type { SavedRun } from "./evaluation-store";
export type AgentSummary = { agent: string; runs: number; totalRecords: number; weightedAccuracy: number; averageLatencyMs: number; totalCostUsd: number };
export function compareAgents(runs: SavedRun[]): AgentSummary[] {
  const groups = new Map<string, SavedRun[]>();
  for (const run of runs) groups.set(run.agent_name, [...(groups.get(run.agent_name) ?? []), run]);
  return [...groups.entries()].map(([agent, items]) => {
    const totalRecords = items.reduce((n,r)=>n+r.metrics.count,0);
    return { agent, runs:items.length, totalRecords,
      weightedAccuracy: totalRecords ? items.reduce((n,r)=>n+r.metrics.exact_match_accuracy*r.metrics.count,0)/totalRecords : 0,
      averageLatencyMs: totalRecords ? items.reduce((n,r)=>n+r.metrics.mean_latency_ms*r.metrics.count,0)/totalRecords : 0,
      totalCostUsd:items.reduce((n,r)=>n+r.metrics.total_cost_usd,0) };
  }).sort((a,b)=>b.weightedAccuracy-a.weightedAccuracy);
}
export function agentTrend(runs: SavedRun[], agent: string) {
  return runs.filter(r=>r.agent_name===agent).sort((a,b)=>a.created_at.localeCompare(b.created_at))
    .map(r=>({date:r.created_at,accuracy:r.metrics.exact_match_accuracy,latencyMs:r.metrics.mean_latency_ms,costUsd:r.metrics.total_cost_usd,count:r.metrics.count}));
}

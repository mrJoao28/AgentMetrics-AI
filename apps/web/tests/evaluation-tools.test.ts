import { describe, expect, it } from "vitest";
import { wilsonInterval } from "../app/lib/confidence-interval";
import { compareAgents, agentTrend } from "../app/lib/run-analytics";
import { exportCsvReport, exportJsonReport, reproducibilityManifest } from "../app/lib/reproducibility";
import type { SavedRun } from "../app/lib/evaluation-store";

const row = { expected: "yes", predicted: "yes", latency_ms: 100, cost_usd: 0.001 };
const runs: SavedRun[] = [
  { id: "1", agent_name: "Agent A", created_at: "2026-01-01T00:00:00Z", records: [row], manifest: {}, metrics: { count: 10, exact_match_accuracy: 0.9, mean_latency_ms: 100, total_cost_usd: 0.01 } },
  { id: "2", agent_name: "Agent A", created_at: "2026-01-02T00:00:00Z", records: [row], manifest: {}, metrics: { count: 30, exact_match_accuracy: 0.5, mean_latency_ms: 300, total_cost_usd: 0.03 } },
  { id: "3", agent_name: "Agent B", created_at: "2026-01-03T00:00:00Z", records: [row], manifest: {}, metrics: { count: 20, exact_match_accuracy: 0.8, mean_latency_ms: 200, total_cost_usd: 0.02 } },
];

describe("evaluation analytics", () => {
  it("weights accuracy and latency by record count", () => {
    const comparison = compareAgents(runs);
    expect(comparison.map(x => x.agent)).toEqual(["Agent B", "Agent A"]);
    expect(comparison[1].weightedAccuracy).toBeCloseTo(0.6);
    expect(comparison[1].averageLatencyMs).toBeCloseTo(250);
    expect(comparison[1].totalCostUsd).toBeCloseTo(0.04);
  });
  it("orders trends chronologically", () => {
    expect(agentTrend([...runs].reverse(), "Agent A").map(r => r.accuracy)).toEqual([0.9, 0.5]);
  });
  it("provides a bounded Wilson confidence interval", () => {
    expect(wilsonInterval(0, 0)).toBeNull();
    expect(wilsonInterval(-1, 10)).toBeNull();
    const ci = wilsonInterval(8, 10)!;
    expect(ci.lower).toBeGreaterThanOrEqual(0);
    expect(ci.lower).toBeLessThan(0.8);
    expect(ci.upper).toBeGreaterThan(0.8);
    expect(ci.upper).toBeLessThanOrEqual(1);
  });
});

describe("reproducible exports", () => {
  it("escapes commas, quotes, and spreadsheet formulas in CSV", () => {
    const csv = exportCsvReport([{expected: '=HYPERLINK("https://example.com")', predicted: 'hello,"world"',latency_ms: 1, cost_usd: 0.2}]);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('hello,""world""');
  });
  it("includes deterministic dataset hash and machine-readable report", async () => {
    const metrics = runs[0].metrics;
    const a = await reproducibilityManifest([row], metrics, "Agent A");
    const b = await reproducibilityManifest([row], metrics, "Agent A");
    expect(a.dataset_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(a.dataset_sha256).toBe(b.dataset_sha256);
    expect(JSON.parse(exportJsonReport(a,[row])).manifest.dataset_sha256).toBe(a.dataset_sha256);
  });
});

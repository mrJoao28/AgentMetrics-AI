import { createClient } from "@supabase/supabase-js";

export type EvaluationRecord = { expected: string; predicted: string; latency_ms: number; cost_usd?: number };
export type EvaluationMetrics = { count: number; exact_match_accuracy: number; mean_latency_ms: number; total_cost_usd: number };
export type SavedRun = { id: string; agent_name: string; created_at: string; metrics: EvaluationMetrics; manifest: Record<string, unknown>; records: EvaluationRecord[] };

export function getSupabase(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase não configurado.");
  return createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
}

export async function saveDataset(token: string, workspaceId: string, name: string, records: EvaluationRecord[], userId: string) {
  const db = getSupabase(token);
  const { data, error } = await db.from("datasets").insert({ workspace_id: workspaceId, name, records, created_by: userId }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function saveRun(token: string, workspaceId: string, agentName: string, records: EvaluationRecord[], metrics: EvaluationMetrics, manifest: Record<string, unknown>, userId: string, datasetId?: string) {
  const db = getSupabase(token);
  const { data, error } = await db.from("evaluation_runs").insert({ workspace_id: workspaceId, agent_name: agentName, records, metrics, manifest, created_by: userId, dataset_id: datasetId ?? null }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function listRuns(token: string, workspaceId: string) {
  const { data, error } = await getSupabase(token).from("evaluation_runs").select("id,agent_name,created_at,metrics,manifest,records").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(250);
  if (error) throw error;
  return (data ?? []) as SavedRun[];
}

export type SavedDataset = { id: string; name: string; created_at: string; records: EvaluationRecord[] };

export async function listDatasets(token: string, workspaceId: string) {
  const { data, error } = await getSupabase(token).from("datasets")
    .select("id,name,created_at,records")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(250);
  if (error) throw error;
  return (data ?? []) as SavedDataset[];
}

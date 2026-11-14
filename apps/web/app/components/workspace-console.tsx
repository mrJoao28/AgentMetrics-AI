"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { authClient, createWorkspace, listWorkspaces } from "../lib/workspaces";
import { listRuns, listDatasets, saveDataset, saveRun, type EvaluationMetrics, type EvaluationRecord, type SavedRun, type SavedDataset } from "../lib/evaluation-store";
import { compareAgents, agentTrend } from "../lib/run-analytics";
import { exportCsvReport, exportJsonReport, reproducibilityManifest } from "../lib/reproducibility";
import { wilsonInterval } from "../lib/confidence-interval";

type Workspace = { id: string; name: string; owner_id: string; created_at: string };
type Props = { records: EvaluationRecord[]; metrics: EvaluationMetrics | null; source: string; onLoadDataset: (rows: EvaluationRecord[], name: string) => void };
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

function download(filename: string, data: string, mime: string) {
  const objectUrl = URL.createObjectURL(new Blob([data], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
function safeName(value: string) { return value.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60); }

export default function WorkspaceConsole({ records, metrics, source, onLoadDataset }: Props) {
  const client = useMemo(() => configured ? authClient() : null, []);
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(configured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpMode, setSignUpMode] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [newWorkspace, setNewWorkspace] = useState("");
  const [agentName, setAgentName] = useState("Meu agente");
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);
  const [savedDatasets, setSavedDatasets] = useState<SavedDataset[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.auth.getUser().then(({ data, error: authError }) => {
      if (active) {
        setUser(authError ? null : data.user);
        setLoadingSession(false);
      }
    }).catch(() => { if (active) setLoadingSession(false); });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [client]);

  const getIdentity = useCallback(async () => {
    if (!client) throw new Error("Supabase não configurado.");
    const { data, error: sessionError } = await client.auth.getSession();
    if (sessionError || !data.session?.access_token || !data.session.user) {
      throw new Error("Sua sessão expirou. Entre novamente.");
    }
    return { token: data.session.access_token, userId: data.session.user.id };
  }, [client]);

  const refreshWorkspaces = useCallback(async () => {
    if (!user) { setWorkspaces([]); return; }
    const { token } = await getIdentity();
    const items = await listWorkspaces(token) as Workspace[];
    setWorkspaces(items);
    setWorkspaceId(current => items.some(w => w.id === current) ? current : items[0]?.id ?? "");
  }, [getIdentity, user]);

  const refreshDatasets = useCallback(async () => {
    if (!user || !workspaceId) { setSavedDatasets([]); return; }
    const { token } = await getIdentity();
    setSavedDatasets(await listDatasets(token, workspaceId));
  }, [getIdentity, user, workspaceId]);

  const refreshRuns = useCallback(async () => {
    if (!user || !workspaceId) { setSavedRuns([]); return; }
    const { token } = await getIdentity();
    const items = await listRuns(token, workspaceId);
    setSavedRuns(items);
    setSelectedRunId(current => items.some(r => r.id === current) ? current : items[0]?.id ?? "");
  }, [getIdentity, user, workspaceId]);

  useEffect(() => {
    if (!user) { setWorkspaces([]); setWorkspaceId(""); setSavedRuns([]); return; }
    void refreshWorkspaces().catch(e => setError(e instanceof Error ? e.message : "Erro ao carregar espaços."));
  }, [user, refreshWorkspaces]);
  useEffect(() => {
    void refreshRuns().catch(e => setError(e instanceof Error ? e.message : "Erro ao carregar avaliações."));
    void refreshDatasets().catch(e => setError(e instanceof Error ? e.message : "Erro ao carregar datasets."));
  }, [refreshRuns, refreshDatasets]);

  async function execute(task: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await task(); }
    catch (e) { setError(e instanceof Error ? e.message : "Ocorreu um erro."); }
    finally { setBusy(false); }
  }

  async function authenticate() {
    if (!client) return;
    await execute(async () => {
      const { data, error: authError } = signUpMode
        ? await client.auth.signUp({ email: email.trim(), password })
        : await client.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      setPassword("");
      if (signUpMode && !data.session) setNotice("Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar.");
      else setNotice("Sessão iniciada.");
    });
  }

  async function createNewWorkspace() {
    await execute(async () => {
      const name = newWorkspace.trim();
      if (!name || name.length > 120) throw new Error("Informe um nome de 1 a 120 caracteres.");
      const { token, userId } = await getIdentity();
      const created = await createWorkspace(token, userId, name);
      await refreshWorkspaces();
      setWorkspaceId(created.id);
      setNewWorkspace("");
      setNotice("Espaço criado.");
    });
  }

  async function persistDataset() {
    await execute(async () => {
      if (!workspaceId) throw new Error("Selecione um espaço de trabalho.");
      const { token, userId } = await getIdentity();
      await saveDataset(token, workspaceId, source.slice(0, 120), records, userId);
      await refreshDatasets();
      setNotice("Dataset salvo com sucesso.");
    });
  }

  async function persistRun() {
    await execute(async () => {
      if (!metrics) throw new Error("Execute uma avaliação antes de salvar.");
      if (!workspaceId) throw new Error("Selecione um espaço de trabalho.");
      const agent = agentName.trim();
      if (!agent) throw new Error("Informe o nome do agente.");
      const { token, userId } = await getIdentity();
      const manifest = await reproducibilityManifest(records, metrics, agent);
      await saveRun(token, workspaceId, agent, records, metrics, manifest, userId);
      await refreshRuns();
      setNotice("Avaliação persistida com sucesso.");
    });
  }

  const comparisons = useMemo(() => compareAgents(savedRuns), [savedRuns]);
  const selectedRun = savedRuns.find(r => r.id === selectedRunId) ?? null;
  const selectedTrend = selectedRun ? agentTrend(savedRuns, selectedRun.agent_name) : [];
  const storedMatches = selectedRun?.metrics.record_matches;
  const hasStoredMatches = Boolean(selectedRun && storedMatches?.length === selectedRun.records.length);
  const interval = hasStoredMatches
    ? wilsonInterval(storedMatches!.filter(Boolean).length, selectedRun!.records.length)
    : null;

  function exportSelected(format: "json" | "csv") {
    if (!selectedRun) return;
    const filename = `agentmetrics-${safeName(selectedRun.agent_name)}-${selectedRun.id.slice(0, 8)}`;
    if (format === "json") download(filename + ".json", exportJsonReport(selectedRun.manifest, selectedRun.records), "application/json");
    else download(filename + ".csv", exportCsvReport(selectedRun.records), "text/csv;charset=utf-8");
  }

  return <section className="panel workspace-console" id="datasets" aria-labelledby="workspace-heading">
    <span id={user ? undefined : "relatorios"} aria-hidden="true"/><div className="panel-heading"><h2 id="workspace-heading">Workspace & histórico</h2><span>Dados persistidos</span></div>
    <p>Faça login para salvar datasets e avaliações em um espaço protegido por permissões do Supabase. Os dados da demonstração pública não são salvos automaticamente.</p>
    {!configured ? <div className="workspace-notice">Persistência ainda não configurada neste ambiente. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY na Vercel para ativar contas e histórico.</div>
    : loadingSession ? <p aria-live="polite">Verificando sessão…</p>
    : !user ? <form className="workspace-form" onSubmit={e => { e.preventDefault(); void authenticate(); }}>
        <label>E-mail<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Senha<input required type="password" minLength={6} autoComplete={signUpMode ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button className="eval-run" disabled={busy} type="submit">{busy ? "Processando…" : signUpMode ? "Criar conta" : "Entrar"}</button>
        <button className="workspace-link" type="button" onClick={() => setSignUpMode(!signUpMode)}>{signUpMode ? "Já tenho conta" : "Criar uma conta"}</button>
      </form>
    : <div className="workspace-stack">
        <div className="workspace-toolbar"><span>Conectado: <strong>{user.email}</strong></span><button className="workspace-link" type="button" onClick={() => void execute(async () => { await client?.auth.signOut(); setNotice("Sessão encerrada."); })}>Sair</button></div>
        <div className="workspace-form">
          <label>Espaço de trabalho<select value={workspaceId} onChange={e => setWorkspaceId(e.target.value)}><option value="">Selecione</option>{workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
          <label>Novo espaço<input maxLength={120} placeholder="Nome do espaço" value={newWorkspace} onChange={e => setNewWorkspace(e.target.value)} /></label>
          <button type="button" className="eval-run" disabled={busy || !newWorkspace.trim()} onClick={() => void createNewWorkspace()}>Criar espaço</button>
        </div>
        {workspaceId && <div className="workspace-actions">
          <label>Nome do agente<input value={agentName} maxLength={120} onChange={e => setAgentName(e.target.value)} /></label>
          <button type="button" className="eval-run" disabled={busy || !metrics} onClick={() => void persistRun()}>Salvar avaliação atual</button>
          <button type="button" className="eval-run secondary-action" disabled={busy || !records.length} onClick={() => void persistDataset()}>Salvar dataset atual</button>
          <button type="button" className="workspace-link" disabled={busy} onClick={() => void execute(refreshRuns)}>Atualizar histórico</button>
        </div>}
        {workspaceId && <div className="workspace-history">
          <h3>Datasets salvos ({savedDatasets.length})</h3>
          {!savedDatasets.length ? <p>Nenhum dataset salvo neste espaço.</p> :
            <div className="workspace-dataset-list">{savedDatasets.map(dataset =>
              <div className="workspace-dataset" key={dataset.id}><div><strong>{dataset.name}</strong><small>{dataset.records.length} registros · {new Date(dataset.created_at).toLocaleString("pt-BR")}</small></div>
                <button type="button" className="eval-run secondary-action" onClick={() => { onLoadDataset(dataset.records, dataset.name); setNotice("Dataset restaurado. Execute a avaliação para obter novos resultados."); }}>Carregar</button>
              </div>)}</div>}
        </div>}
        {workspaceId && <div className="workspace-history">
          <h3>Histórico de avaliações ({savedRuns.length})</h3>
          {!savedRuns.length ? <p>Nenhuma avaliação salva neste espaço.</p> : <>
            <label>Avaliação<select value={selectedRunId} onChange={e => setSelectedRunId(e.target.value)}>{savedRuns.map(r => <option key={r.id} value={r.id}>{r.agent_name} · {new Date(r.created_at).toLocaleString("pt-BR")}</option>)}</select></label>
            {selectedRun && <div className="workspace-summary"><span>{selectedRun.metrics.count} registros</span><span>{(selectedRun.metrics.exact_match_accuracy * 100).toFixed(1)}% exatidão</span><span>{selectedRun.metrics.mean_latency_ms.toFixed(0)} ms</span></div>}
            {interval && <p>Intervalo de confiança Wilson (95%): {(interval.lower * 100).toFixed(1)}% a {(interval.upper * 100).toFixed(1)}%.</p>}
            {selectedRun && !hasStoredMatches && <p>Intervalo de confiança indisponível para esta avaliação antiga; execute e salve novamente para registrar as decisões por item.</p>}
            <div className="eval-controls"><button type="button" className="eval-run secondary-action" onClick={() => exportSelected("json")}>Exportar JSON</button><button type="button" className="eval-run secondary-action" onClick={() => exportSelected("csv")}>Exportar CSV</button></div>
          </>}
          <h3>Comparação por agente</h3>
          {!comparisons.length ? <p>Salve avaliações de dois ou mais agentes para comparar seus resultados.</p> :
            <div className="table-wrap workspace-table"><table><thead><tr><th>Agente</th><th>Execuções</th><th>Registros</th><th>Acurácia ponderada</th><th>Latência média</th></tr></thead><tbody>{comparisons.map(c => <tr key={c.agent}><td>{c.agent}</td><td>{c.runs}</td><td>{c.totalRecords}</td><td>{(c.weightedAccuracy * 100).toFixed(1)}%</td><td>{c.averageLatencyMs.toFixed(0)} ms</td></tr>)}</tbody></table></div>}
          {selectedRun && <p className="workspace-trend">Tendência de {selectedRun.agent_name}: {selectedTrend.map(t => (t.accuracy * 100).toFixed(1) + "%").join(" → ")} ({selectedTrend.length} execuções em ordem cronológica).</p>}
        </div>}
      </div>}
    <span id="relatorios" className="workspace-section-anchor" aria-hidden="true"/>
    {error && <p role="alert" className="eval-error">{error}</p>}
    {notice && <p role="status" className="workspace-notice">{notice}</p>}
  </section>;
}

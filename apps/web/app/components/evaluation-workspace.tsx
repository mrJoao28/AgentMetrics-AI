"use client";

import { useState } from "react";

type Result = { count: number; exact_match_accuracy: number; mean_latency_ms: number; total_cost_usd: number };
type RecordRow = {expected:string;predicted:string;latency_ms:number;cost_usd:number};
const sample:RecordRow[] = [
  {expected:"Refund available",predicted:"Refund available",latency_ms:120,cost_usd:0.001},
  {expected:"Order shipped",predicted:"Order processing",latency_ms:210,cost_usd:0.002},
  {expected:"Contact support",predicted:"contact support",latency_ms:150,cost_usd:0.0015},
];

export default function EvaluationWorkspace() {
  const [rows,setRows] = useState<RecordRow[]>(sample);
  const [result,setResult] = useState<Result|null>(null);
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [source,setSource] = useState("Exemplo do repositório (3 registros)");
  async function run() {
    setBusy(true);setError("");setResult(null);
    try {
      const response = await fetch("/api/evaluate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({records:rows})});
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? body.detail ?? "Falha na avaliação");
      setResult(body as Result);
    } catch(e) {setError(e instanceof Error?e.message:"Erro desconhecido");}
    finally {setBusy(false);}
  }
  async function upload(file:File) {
    setResult(null);setError("");
    if (file.size>2_000_000){setError("Arquivo acima de 2 MB.");return;}
    try {
      const lines=(await file.text()).split(/\r?\n/).filter(x=>x.trim());
      if (!lines.length||lines.length>10000) throw new Error("O arquivo precisa ter entre 1 e 10.000 linhas.");
      const parsed:RecordRow[]=lines.map((line,i)=>{
        let value:unknown;
        try {value=JSON.parse(line);} catch {throw new Error(`JSON inválido na linha ${i+1}`);}
        if(!value||typeof value!=="object")throw new Error(`Registro inválido na linha ${i+1}`);
        const r=value as Record<string,unknown>;
        if(typeof r.expected!=="string"||typeof r.predicted!=="string"||typeof r.latency_ms!=="number"||!Number.isFinite(r.latency_ms)||r.latency_ms<0|| (r.cost_usd!==undefined&&(typeof r.cost_usd!=="number"||!Number.isFinite(r.cost_usd)||r.cost_usd<0))) throw new Error(`Campos inválidos na linha ${i+1}`);
        return {expected:r.expected,predicted:r.predicted,latency_ms:r.latency_ms,cost_usd:typeof r.cost_usd==="number"?r.cost_usd:0};
      });
      setRows(parsed);setSource(file.name);
    }catch(e){setError(e instanceof Error?e.message:"Falha na leitura");}
  }
  return <section className="panel live-evaluation" aria-labelledby="live-heading">
    <div className="panel-heading"><h2 id="live-heading">Avaliação com dados reais</h2><span>Motor Python</span></div>
    <p>Importe um arquivo JSONL e execute a avaliação de correspondência exata, latência e custo. O exemplo inicial é sintético.</p>
    <div className="eval-controls"><label className="upload-control">Importar JSONL<input type="file" accept=".jsonl,.txt,application/x-ndjson" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value="";}}/></label><button className="eval-run" onClick={()=>void run()} disabled={busy}>{busy?"Avaliando…":"Executar avaliação"}</button></div>
    <div className="eval-source">Fonte: {source} · {rows.length.toLocaleString("pt-BR")} registros</div>
    {error&&<p className="eval-error" role="alert">{error}</p>}
    {result&&<div className="eval-results" aria-live="polite"><div><small>Registros avaliados</small><strong>{result.count.toLocaleString("pt-BR")}</strong></div><div><small>Correspondência exata</small><strong>{(result.exact_match_accuracy*100).toFixed(1)}%</strong></div><div><small>Latência média</small><strong>{result.mean_latency_ms.toFixed(1)} ms</strong></div><div><small>Custo total</small><strong>US$ {result.total_cost_usd.toFixed(4)}</strong></div></div>}
    <p className="eval-method">Acurácia por correspondência exata normalizada (espaços externos e caixa); não representa precisão, recall ou qualidade semântica.</p>
  </section>;
}

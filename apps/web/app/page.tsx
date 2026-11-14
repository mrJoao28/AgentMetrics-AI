"use client";

import { useMemo, useState } from "react";
import EvaluationWorkspace, { type DashboardEvaluation } from "./components/evaluation-workspace";
import { buildAccuracyGroups, buildLatencyHistogram } from "./lib/dashboard-metrics";
import { Activity, ArrowUpRight, BarChart3, CalendarDays, Database, FileText, FlaskConical, GitCompareArrows, Settings2, ShieldCheck, Target, Zap, Coins } from "lucide-react";

function BrandMark({ size = 34 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" role="img" aria-label="AgentMetrics AI logo">
    <defs><linearGradient id="brand-gradient" x1="4" y1="44" x2="42" y2="4" gradientUnits="userSpaceOnUse"><stop stopColor="#7465F6"/><stop offset="1" stopColor="#A999FF"/></linearGradient></defs>
    <path d="M20.2 6.5c1.8-3.1 5.8-3.1 7.6 0l18 31.2c1.9 3.3-.5 7.3-4.3 7.3h-4.4c-1.6 0-3.1-.9-3.9-2.3L24 26.8l-9.2 15.9c-.8 1.4-2.3 2.3-3.9 2.3H6.5c-3.8 0-6.2-4-4.3-7.3l18-31.2Z" fill="url(#brand-gradient)"/>
    <path d="m24 27 7.7 13.4H16.3L24 27Z" fill="#10121C"/>
  </svg>;
}

const nav = [
  { label: "Visão geral", icon: BarChart3, href: "#visao-geral" },
  { label: "Avaliações", icon: Activity, href: "#avaliacoes" },
  { label: "Comparações", icon: GitCompareArrows, href: "#comparacoes" },
  { label: "Datasets", icon: Database, href: "#datasets" },
  { label: "Histórico e relatórios", icon: FileText, href: "#relatorios" },
  { label: "Metodologia", icon: FlaskConical, href: "#metodologia" },
];

function formatPct(value: number) { return new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(value); }
function formatNumber(value: number) { return new Intl.NumberFormat("pt-BR").format(value); }
function formatUSD(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", minimumFractionDigits: 3, maximumFractionDigits: 4 }).format(value); }
export default function Home() {
  const [evaluation, setEvaluation] = useState<DashboardEvaluation | null>(null);
  const [activeNav, setActiveNav] = useState("#visao-geral");

  const groups = useMemo(
    () => evaluation ? buildAccuracyGroups(evaluation.matches) : [],
    [evaluation],
  );

  const latency = useMemo(
    () => evaluation ? buildLatencyHistogram(evaluation.records) : [],
    [evaluation],
  );

  const hasData = Boolean(evaluation);
  const metrics = [
    { label: "Registros avaliados", value: hasData ? formatNumber(evaluation!.metrics.count) : "—", icon: Target, tone: "blue" },
    { label: "Correspondência exata", value: hasData ? formatPct(evaluation!.metrics.exact_match_accuracy) : "—", icon: ShieldCheck, tone: "purple" },
    { label: "Latência média informada", value: hasData ? `${evaluation!.metrics.mean_latency_ms.toFixed(1)} ms` : "—", icon: Zap, tone: "blue" },
    { label: "Custo total informado", value: hasData ? formatUSD(evaluation!.metrics.total_cost_usd) : "—", icon: Coins, tone: "amber" },
  ];

  return <div className="shell">
    <aside className="sidebar">
      <a className="brand" href="#visao-geral" aria-label="AgentMetrics AI — início"><BrandMark size={42}/><div><strong>AgentMetrics AI</strong><small>Avaliação e análise de agentes de IA</small></div></a>
      <nav aria-label="Navegação principal">{nav.map(({label, icon: Icon, href}) => <a key={href} href={href} className={activeNav === href ? "navitem active" : "navitem"} aria-current={activeNav === href ? "location" : undefined} onClick={() => setActiveNav(href)}><Icon size={19}/><span>{label}</span></a>)}</nav>
      <div className="sidebar-bottom"><a href="#metodologia" className="navitem" onClick={() => setActiveNav("#metodologia")}><Settings2 size={19}/><span>Sobre a avaliação</span></a><div className="plan-card"><div className="plan-title">Demonstração pública</div><p>Execute avaliações com dados sintéticos ou importe seus próprios registros.</p><small>Sem dados fictícios nos resultados</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar" id="visao-geral"><div><h1>Visão geral</h1><p>Analise e compare resultados reproduzíveis de avaliações de agentes de IA.</p></div><div className="header-actions"><div className="date-range"><CalendarDays size={18}/>{hasData ? "Última avaliação nesta sessão" : "Aguardando avaliação"}</div><span className="avatar" aria-label="AgentMetrics AI"><BrandMark size={26}/></span></div></header>
      <div className="content">
        <div className="demo-banner" role="note"><ShieldCheck size={16}/><span>Os indicadores desta visão geral refletem apenas a última avaliação executada nesta sessão. Os cenários prontos são sintéticos; latência e custo vêm dos registros enviados e não são medidos pelo servidor.</span></div>
        {hasData && <p className="eval-source dashboard-source">Fonte analisada: {evaluation!.source}</p>}
        {!hasData && <div className="dashboard-empty"><div><strong>Comece executando uma avaliação</strong><p>Selecione um cenário ou importe dados JSONL na seção Avaliações. Os indicadores e gráficos serão preenchidos com resultados calculados, sem números inventados.</p></div><a className="eval-run" href="#avaliacoes">Ir para avaliações <ArrowUpRight size={16}/></a></div>}
        <section className="metrics" aria-label="Indicadores da última avaliação">{metrics.map(({label,value,icon:Icon,tone})=><article className="metric" key={label}><div className="metric-top"><span className={`metric-icon ${tone}`}><Icon size={22}/></span><span>{label}</span></div><div className="metric-bottom"><strong>{value}</strong></div></article>)}</section>
        <div className="charts" id="comparacoes">
          <section className="panel performance"><h2>Correspondência exata por lote</h2><p>Os registros da última avaliação são divididos em até três grupos, sem comparar agentes distintos.</p>
            {hasData ? <><div className="bar-chart"><div className="chart-grid"><span>100%</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span></div><div className="bar-groups">{groups.map((group,i)=><div className="bar-group" key={i}><div className="bar-set"><div className="data-bar bar-0" style={{height:`${group.accuracy * 100}%`,minHeight:group.accuracy>0?2:0,width:"48%"}} title={`${group.count} registros · ${formatPct(group.accuracy)}`}/></div><span>{group.label}</span></div>)}</div></div><div className="legend">Percentual de correspondência por lote · {formatNumber(evaluation!.metrics.count)} registros</div></> : <p className="chart-empty">O comparativo aparecerá após a primeira avaliação.</p>}
          </section>
          <section className="panel latency"><h2>Distribuição de latência</h2><p>Histograma dos tempos de resposta informados em cada registro.</p>
            {hasData ? <><div className="latency-bars">{latency.map((bin,i)=><div className="latency-column" key={i} title={`${bin.label}: ${bin.count} registros`}><span>{bin.count}</span><div className="latency-track"><div style={{height:`${bin.count / Math.max(1,...latency.map(x=>x.count)) * 100}%`}}/></div><small>{bin.label}</small></div>)}</div></> : <p className="chart-empty">Os intervalos de latência serão calculados a partir dos dados enviados.</p>}
          </section>
        </div>
        <section id="avaliacoes"><EvaluationWorkspace onCompleted={setEvaluation}/></section>
        <div className="bottom-grid">
          <section className="panel evaluations"><div className="panel-heading"><h2>Registros da última avaliação</h2><span>{hasData ? "Dados analisados" : "Nenhum registro"}</span></div>
            <div className="table-wrap"><table><thead><tr><th>Registro</th><th>Resultado</th><th>Latência</th><th>Custo</th></tr></thead><tbody>{evaluation?.records.slice(0,8).map((r,i)=><tr key={i}><td>#{i+1}</td><td><span className={evaluation.matches[i]?"result success":"result error"}>{evaluation.matches[i]?"Correto":"Divergente"}</span></td><td>{r.latency_ms} ms</td><td>{formatUSD(r.cost_usd)}</td></tr>) ?? <tr><td colSpan={4}>Execute uma avaliação para visualizar registros.</td></tr>}</tbody></table></div>
          </section>
          <section className="panel experiments" id="metodologia"><h2>Metodologia transparente</h2><p>Entenda o que cada resultado realmente representa.</p><div className="method-details"><p><strong>Exatidão:</strong> comparação de texto após remover espaços externos e normalizar maiúsculas/minúsculas.</p><p><strong>Latência e custo:</strong> agregados dos valores fornecidos no JSONL, sem cronômetro ou medição de tokens.</p><p><strong>Dados de demonstração:</strong> exemplos sintéticos, não resultados de modelos reais.</p><p><strong>Persistência:</strong> avaliações de usuários autenticados podem ser salvas em workspaces Supabase.</p></div></section>
        </div>
        <footer>AgentMetrics AI · <a href="https://github.com/mrJoao28/AgentMetrics-AI" target="_blank" rel="noopener noreferrer">Código aberto <ArrowUpRight size={12}/></a> · <a href="https://github.com/mrJoao28/AgentMetrics-AI/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">Licença MIT</a> · Métricas reproduzíveis</footer>
      </div>
    </main>
  </div>;
}

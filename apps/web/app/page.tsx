import { Activity, ArrowUpRight, BarChart3, Database, FileText, GitCompareArrows, Layers3, Settings2, ShieldCheck } from "lucide-react";

const nav = [
  { label: "Overview", icon: BarChart3, active: true },
  { label: "Evaluations", icon: Activity },
  { label: "Comparisons", icon: GitCompareArrows },
  { label: "Datasets", icon: Database },
  { label: "Reports", icon: FileText },
];
const evaluations = [
  { name: "Customer support / baseline", dataset: "support-demo-v1", runs: "120", score: "84.2%", latency: "412 ms", status: "Complete" },
  { name: "Customer support / candidate", dataset: "support-demo-v1", runs: "120", score: "88.3%", latency: "398 ms", status: "Complete" },
  { name: "Order tracking / baseline", dataset: "orders-demo-v1", runs: "80", score: "91.3%", latency: "362 ms", status: "Complete" },
];
export default function Home() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brandmark"><Layers3 size={17}/></div><span>AgentMetrics</span><span className="brandtag">AI</span></div>
        <div className="workspace"><span className="workspace-avatar">J</span><span><strong>Research workspace</strong><small>Personal workspace</small></span><span className="chevron">⌄</span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">{nav.map(({label,icon:Icon,active})=><a key={label} href={active?"/":"#preview"} className={active?"navitem active":"navitem"} aria-current={active?"page":undefined}><Icon size={17}/>{label}</a>)}</nav>
        <div className="sidebar-bottom"><a href="#methodology" className="navitem"><ShieldCheck size={17}/>Methodology</a><a href="https://github.com/mrJoao28/AgentMetrics-AI" className="navitem"><Settings2 size={17}/>Repository <ArrowUpRight size={13}/></a><div className="sidebar-note">OPEN SOURCE · EARLY ACCESS</div></div>
      </aside>
      <main className="main">
        <header className="topbar"><span>Workspace <span className="slash">/</span> Overview</span><span className="top-right"><span className="status-dot"/> Local demo dataset <span className="avatar">J</span></span></header>
        <div className="content">
          <div className="heading"><div><div className="eyebrow">ANALYTICS / OVERVIEW</div><h1>Evaluation overview</h1><p>Monitor quality, latency, and consistency across agent experiments.</p></div><span className="demo-tag">DEMO ENVIRONMENT</span></div>
          <div className="notice"><ShieldCheck size={16}/><span>Illustrative data only. Metrics below are placeholders, not measured benchmark results.</span></div>
          <section className="metrics" aria-label="Illustrative metrics">
            {[{label:"Evaluation runs",value:"320",change:"Across 3 demo experiments"},{label:"Exact-match accuracy",value:"87.6%",change:"Demo aggregate"},{label:"Median latency",value:"398",unit:"ms",change:"Illustrative response time"},{label:"Agent variants",value:"03",change:"In demo workspace"}].map(m=><div className="metric" key={m.label}><span className="metric-label">{m.label}</span><div className="metric-value">{m.value}<span>{m.unit}</span></div><div className="metric-caption">{m.change}</div></div>)}
          </section>
          <div className="section-heading"><div><h2>Evaluation activity</h2><p>Example score distribution across recent runs</p></div><span className="muted">Last 8 runs · Demo</span></div>
          <div className="chart-panel"><div className="chart-header"><span><span className="legend-dot"/> Exact-match accuracy</span><span>Higher is better</span></div><div className="chart"><div className="gridline g1"/><div className="gridline g2"/><div className="gridline g3"/><div className="bars">{[62,70,66,76,71,83,79,88].map((v,i)=><div key={i} className="bar-column"><div className="bar" style={{height:`${v}%`}}/><span>R{i+1}</span></div>)}</div></div></div>
          <div className="section-heading table-title"><div><h2>Recent evaluations</h2><p>Example experiments and their metrics</p></div><span className="muted">3 demo evaluations</span></div>
          <div className="table-wrap"><table><thead><tr><th>Evaluation</th><th>Dataset</th><th>Runs</th><th>Accuracy</th><th>Avg. latency</th><th>Status</th></tr></thead><tbody>{evaluations.map(e=><tr key={e.name}><td className="primary-cell">{e.name}</td><td>{e.dataset}</td><td>{e.runs}</td><td>{e.score}</td><td>{e.latency}</td><td><span className="complete"><span/> {e.status}</span></td></tr>)}</tbody></table></div>
          <footer id="methodology">AgentMetrics AI · Engineering-first evaluation · <a href="https://github.com/mrJoao28/AgentMetrics-AI/blob/main/docs/statistical-methodology.md">Statistical methodology ↗</a></footer>
        </div>
      </main>
    </div>
  );
}

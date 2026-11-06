import EvaluationWorkspace from "./components/evaluation-workspace";
import { Activity, ArrowUpRight, BarChart3, CalendarDays, Database, FileText, FlaskConical, GitCompareArrows, Settings2, ShieldCheck, Target, Zap, Coins } from "lucide-react";

function BrandMark({size=34}:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" role="img" aria-label="AgentMetrics AI logo">
    <defs><linearGradient id="brand-gradient" x1="4" y1="44" x2="42" y2="4" gradientUnits="userSpaceOnUse"><stop stopColor="#7465F6"/><stop offset="1" stopColor="#A999FF"/></linearGradient></defs>
    <path d="M20.2 6.5c1.8-3.1 5.8-3.1 7.6 0l18 31.2c1.9 3.3-.5 7.3-4.3 7.3h-4.4c-1.6 0-3.1-.9-3.9-2.3L24 26.8l-9.2 15.9c-.8 1.4-2.3 2.3-3.9 2.3H6.5c-3.8 0-6.2-4-4.3-7.3l18-31.2Z" fill="url(#brand-gradient)"/>
    <path d="m24 27 7.7 13.4H16.3L24 27Z" fill="#10121C"/>
  </svg>;
}
const nav = [
  { label: "Visão geral", icon: BarChart3, active: true },
  { label: "Avaliações", icon: Activity, href: "#avaliacoes" },
  { label: "Comparações", icon: GitCompareArrows, href: "#comparacoes" },
  { label: "Datasets", icon: Database, href: "#avaliacoes" },
  { label: "Experimentos", icon: FlaskConical, href: "#experimentos" },
  { label: "Relatórios", icon: FileText, href: "#metodologia" },
];
const evaluations = [
  { id:"#12840", agent:"Agente A", task:"Extração de informações", result:"Correto", latency:"1,21 s", ok:true },
  { id:"#12839", agent:"Agente B", task:"Classificação de texto", result:"Correto", latency:"1,48 s", ok:true },
  { id:"#12838", agent:"Agente C", task:"Resposta aberta", result:"Incorreto", latency:"2,37 s", ok:false },
  { id:"#12837", agent:"Agente A", task:"Raciocínio lógico", result:"Correto", latency:"1,09 s", ok:true },
];
const metrics = [
  {label:"Avaliações realizadas",value:"12.840",change:"+18,4%",icon:Target,tone:"blue"},
  {label:"Acurácia média",value:"91,2%",change:"+4,7 p.p.",icon:ShieldCheck,tone:"purple"},
  {label:"Latência média",value:"1,43 s",change:"−22,1%",icon:Zap,tone:"blue"},
  {label:"Custo estimado",value:"US$ 18,40",change:"−27,6%",icon:Coins,tone:"amber"},
];
export default function Home() {
 return <div className="shell">
  <aside className="sidebar">
   <div className="brand"><BrandMark size={42}/><div><strong>AgentMetrics AI</strong><small>Avaliação e análise de agentes de IA</small></div></div>
   <nav aria-label="Navegação principal">{nav.map(({label,icon:Icon,active,...rest})=><a key={label} href={active?"/":("href" in rest ? rest.href : "#avaliacoes")} className={active?"navitem active":"navitem"} aria-current={active?"page":undefined}><Icon size={19}/><span>{label}</span></a>)}</nav>
   <div className="sidebar-bottom"><a href="#metodologia" className="navitem"><Settings2 size={19}/><span>Configurações</span></a><div className="plan-card"><div className="plan-title">Versão demonstrativa</div><p>Explore os cenários e importe seus dados</p><div className="plan-progress"><span/></div><small>Dados simulados</small></div></div>
  </aside>
  <main className="main">
   <header className="topbar"><div><h1>Visão Geral</h1><p>Monitore, avalie e compare o desempenho de agentes de IA.</p></div><div className="header-actions"><div className="date-range"><CalendarDays size={18}/> Cenários demonstrativos</div><span className="avatar">JF</span></div></header>
   <div className="content">
    <div className="demo-banner"><ShieldCheck size={16}/><span>Ambiente público de demonstração. Os KPIs e gráficos desta visão geral são fictícios; as avaliações executadas abaixo são calculadas pelo backend Python.</span></div>
    <section className="metrics" aria-label="Indicadores ilustrativos">{metrics.map(({label,value,change,icon:Icon,tone})=><article className="metric" key={label}><div className="metric-top"><span className={`metric-icon ${tone}`}><Icon size={22}/></span><span>{label}</span></div><div className="metric-bottom"><strong>{value}</strong><span className="positive">{change}</span></div></article>)}</section>
    <div className="charts" id="comparacoes">
     <section className="panel performance"><h2>Desempenho por Agente</h2><p>Comparativo de acurácia, precisão e recall.</p><div className="bar-chart"><div className="chart-grid"><span>100%</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span></div><div className="bar-groups">{[[93.8,92.9,94.1],[91.4,90.7,91.8],[88.5,87.9,89.2]].map((group,i)=><div className="bar-group" key={i}><div className="bar-set">{group.map((v,j)=><div className={`data-bar bar-${j}`} style={{height:`${v}%`}} title={`${v}%`} key={j}/>)}</div><span>Agente {String.fromCharCode(65+i)}</span></div>)}</div></div><div className="legend"><span><i className="purple-key"/> Acurácia</span><span><i className="green-key"/> Precisão</span><span><i className="blue-key"/> Recall</span></div></section>
     <section className="panel latency"><h2>Distribuição de Latência</h2><p>Tempo de resposta dos agentes (segundos).</p><div className="curve-chart"><svg viewBox="0 0 500 220" preserveAspectRatio="none" aria-label="Curvas ilustrativas de distribuição de latência" role="img"><path d="M0 200 H500 M0 150 H500 M0 100 H500 M0 50 H500" stroke="#303644" strokeWidth="1"/><path d="M0 200 C70 200 74 18 132 32 S193 200 500 200" fill="#8875FF" fillOpacity=".16" stroke="#9180FF" strokeWidth="3"/><path d="M0 200 C100 200 115 72 183 65 S263 200 500 200" fill="#3BC995" fillOpacity=".12" stroke="#43C99B" strokeWidth="3"/><path d="M0 200 C145 200 171 92 243 92 S345 200 500 200" fill="#4CB5F4" fillOpacity=".12" stroke="#53B8FA" strokeWidth="3"/></svg><div className="curve-labels"><span>0,5</span><span>1,0</span><span>1,5</span><span>2,0</span><span>2,5</span><span>3,0</span></div></div><div className="legend"><span><i className="purple-key"/> Agente A</span><span><i className="green-key"/> Agente B</span><span><i className="blue-key"/> Agente C</span></div></section>
    </div>
    <div id="avaliacoes"><EvaluationWorkspace /></div>
    <div className="bottom-grid"><section className="panel evaluations"><div className="panel-heading"><h2>Últimas Avaliações</h2><span>Prévia</span></div><div className="table-wrap"><table><thead><tr><th>#</th><th>Agente</th><th>Tarefa</th><th>Resultado</th><th>Latência</th></tr></thead><tbody>{evaluations.map(e=><tr key={e.id}><td>{e.id}</td><td className="agent-cell"><span className="agent-dot"/> {e.agent}</td><td>{e.task}</td><td><span className={e.ok?"result success":"result error"}>{e.result}</span></td><td>{e.latency}</td></tr>)}</tbody></table></div></section>
    <section className="panel experiments" id="experimentos"><h2>Status dos Experimentos</h2><p>3 experimentos ilustrativos</p>{[{name:"A/B – Estratégia de prompting",pct:72},{name:"Avaliação de RAG",pct:48},{name:"Comparação de agentes (v2)",pct:19}].map(e=><div className="experiment" key={e.name}><div className="experiment-icon"><FlaskConical size={17}/></div><div className="experiment-body"><div><span>{e.name}</span><strong>{e.pct}%</strong></div><div className="progress"><span style={{width:`${e.pct}%`}}/></div></div></div>)}</section></div>
    <footer id="metodologia">AgentMetrics AI · <a href="https://github.com/mrJoao28/AgentMetrics-AI">Código aberto <ArrowUpRight size={12}/></a> · <a href="https://github.com/mrJoao28/AgentMetrics-AI/blob/main/LICENSE">Licença MIT</a> · Indicadores de demonstração</footer>
   </div>
  </main>
 </div>;
}

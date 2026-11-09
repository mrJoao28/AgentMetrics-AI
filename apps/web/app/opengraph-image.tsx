import { ImageResponse } from "next/og";

export const alt = "AgentMetrics AI — avaliação reproduzível de agentes de IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const pill = { display:"flex", alignItems:"center", border:"1px solid #393c59", borderRadius:999, padding:"10px 18px", color:"#c5c8e1", fontSize:20 } as const;

export default function Image() {
  return new ImageResponse(
    <div style={{ width:"100%", height:"100%", background:"linear-gradient(120deg, #0b0f19 0%, #171a2b 65%, #241d3b 100%)", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:64, color:"#f4f4fa", fontFamily:"Arial, sans-serif" }}>
      <div style={{ display:"flex", alignItems:"center", gap:18 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", borderRadius:16, background:"linear-gradient(145deg, #6d5ee8, #a491ff)", width:64, height:64, fontSize:42, fontWeight:800 }}>A</div>
        <div style={{display:"flex", flexDirection:"column"}}>
          <span style={{ fontSize:32, fontWeight:800, letterSpacing:-1 }}>AgentMetrics AI</span>
          <span style={{ fontSize:17, color:"#a3acc9" }}>Open source · Next.js · Python · Supabase</span>
        </div>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:20, maxWidth:1050}}>
        <span style={{ fontSize:20, color:"#a997ff", fontWeight:700, letterSpacing:2 }}>AVALIAÇÃO REPRODUZÍVEL DE AGENTES</span>
        <span style={{fontSize:67, fontWeight:800, letterSpacing:-2, lineHeight:1.08}}>Avalie agentes de IA <span style={{color:"#ab9bff"}}>com evidências.</span></span>
        <span style={{ fontSize:26, color:"#bac4d8" }}>Datasets · Métricas · Comparações · Histórico · Relatórios</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <div style={pill}>Avaliações calculadas pelo motor Python</div>
        <div style={pill}>Dashboard interativo</div>
      </div>
      <div style={{ position:"absolute", right:-95, top:125, width:295, height:295, borderRadius:999, border:"2px solid #7368bd", opacity:.35, boxShadow:"0 0 0 58px #6555b322, 0 0 0 119px #6555b312" }}/>
    </div>,
    size
  );
}

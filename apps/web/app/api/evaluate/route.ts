import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const backend = process.env.AGENTMETRICS_API_URL;
  if (!backend) return NextResponse.json({ error: "Backend Python não configurado. Defina AGENTMETRICS_API_URL no servidor." }, { status: 503 });
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({error:"JSON inválido"}, {status:400}); }
  if (!payload || typeof payload !== "object" || !("records" in payload) || !Array.isArray(payload.records) || payload.records.length < 1 || payload.records.length > 10000) {
    return NextResponse.json({error:"Envie de 1 a 10.000 registros."},{status:400});
  }
  try {
    const response = await fetch(new URL("/v1/evaluate", backend), {
      method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000), cache: "no-store",
    });
    const data: unknown = await response.json();
    return NextResponse.json(data, {status:response.status});
  } catch {
    return NextResponse.json({error:"Não foi possível consultar o serviço Python."},{status:502});
  }
}

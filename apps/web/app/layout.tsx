import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentMetrics AI — Avaliação de agentes",
  description: "Plataforma de análise, comparação e avaliação estatística de agentes de IA.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

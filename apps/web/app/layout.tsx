import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://web-mrjoao28s-projects.vercel.app"),
  title: "AgentMetrics AI | Avaliação reproduzível de agentes de IA",
  description: "Plataforma open-source de avaliação de agentes de IA com métricas reproduzíveis, histórico, comparação, datasets e relatórios. Explore a demonstração interativa.",
  applicationName: "AgentMetrics AI",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "AgentMetrics AI",
    title: "AgentMetrics AI — Avalie agentes de IA com evidências",
    description: "Compare resultados, importe datasets e explore métricas reais de avaliação com Next.js, Python e Supabase.",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "AgentMetrics AI: plataforma de avaliação de agentes com painel em tema escuro e visual violeta" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentMetrics AI — Avalie agentes de IA com evidências",
    description: "Plataforma open-source com avaliações reproduzíveis e comparação de agentes.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentMetrics — Agent evaluation workspace",
  description: "An engineering workspace for reproducible agent evaluation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

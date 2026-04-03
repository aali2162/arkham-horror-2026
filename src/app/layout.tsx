import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arkham Horror 2026 — Interactive Learning Companion",
  description:
    "Learn Arkham Horror: The Card Game (2026 Edition) with interactive guides, turn-by-turn play tracking, and real-time session sync.",
  openGraph: {
    title: "Arkham Horror 2026 — Interactive Learning Companion",
    description: "Interactive rules and real-time session tracking for Arkham Horror: The Card Game.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

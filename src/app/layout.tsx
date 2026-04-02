import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arkham Horror 2026 — Interactive Learning Companion",
  description:
    "Learn Arkham Horror: The Card Game (2026 Edition) with zero assumed knowledge. Interactive rules, real-time player tracking, shareable sessions.",
  openGraph: {
    title: "Arkham Horror 2026 — Interactive Learning Companion",
    description: "Learn the complete rules of Arkham Horror: The Card Game with interactive guides and real-time session tracking.",
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

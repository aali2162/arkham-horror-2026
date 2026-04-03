import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Train — Board Game Learning Platform",
  description:
    "Game Train makes board games easy to learn and play. Interactive rules, real-time session tracking, and step-by-step guides. Starting with Arkham Horror: The Card Game.",
  openGraph: {
    title: "Game Train — Board Game Learning Platform",
    description: "Game Train makes board games easy to learn and play. Interactive rules, real-time session tracking, and step-by-step guides. Starting with Arkham Horror: The Card Game.",
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

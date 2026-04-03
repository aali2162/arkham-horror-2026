"use client";
import Link from "next/link";

export default function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}
      className="inline-flex items-center gap-2 text-sm text-ark-text-muted hover:text-ark-text-dim transition-all duration-200 mb-6 group">
      <span className="text-base transition-transform duration-200 group-hover:-translate-x-1">←</span>
      <span className="font-decorative tracking-wide">{label}</span>
    </Link>
  );
}

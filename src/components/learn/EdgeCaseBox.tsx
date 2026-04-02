import { EdgeCase } from "@/types";

export default function EdgeCaseBox({ question, answer }: EdgeCase) {
  return (
    <div className="edge-case-box">
      <div className="flex items-start gap-3">
        <span className="text-ark-amber text-lg mt-0.5">❓</span>
        <div>
          <p className="font-bold text-ark-amber/90 text-sm mb-1">{question}</p>
          <p className="text-ark-text-dim text-[15px] leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

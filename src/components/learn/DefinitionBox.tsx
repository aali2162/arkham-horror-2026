import { Definition } from "@/types";

export default function DefinitionBox({ term, meaning }: Definition) {
  return (
    <div className="definition-box">
      <div className="flex items-start gap-3">
        <span className="text-ark-blue text-lg mt-0.5">📘</span>
        <div>
          <p className="font-bold text-ark-blue text-sm uppercase tracking-wide mb-1">
            {term}
          </p>
          <p className="text-ark-text text-[15px] leading-relaxed">{meaning}</p>
        </div>
      </div>
    </div>
  );
}

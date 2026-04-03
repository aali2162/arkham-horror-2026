interface DefinitionBoxProps {
  term: string;
  definition: string;
}

export default function DefinitionBox({ term, definition }: DefinitionBoxProps) {
  return (
    <div className="definition-box my-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
          style={{ background: "rgba(74,143,212,0.2)", border: "1px solid rgba(74,143,212,0.4)" }}>
          <span className="text-[10px] font-bold text-ark-blue">i</span>
        </div>
        <div>
          <span className="font-decorative font-semibold text-sm" style={{ color: "#6ab4f5" }}>{term}</span>
          <p className="text-ark-text-dim text-sm leading-relaxed mt-1">{definition}</p>
        </div>
      </div>
    </div>
  );
}

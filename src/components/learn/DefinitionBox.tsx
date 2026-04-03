interface DefinitionBoxProps {
  term: string;
  meaning: string;
}

export default function DefinitionBox({ term, meaning }: DefinitionBoxProps) {
  return (
    <div className="definition-box my-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
          style={{ background: "rgba(74,143,212,0.12)", border: "1px solid rgba(74,143,212,0.35)" }}>
          <span className="text-[10px] font-bold" style={{ color: "#4a8fd4" }}>i</span>
        </div>
        <div>
          <span className="font-heading font-semibold text-sm" style={{ color: "#2d5a8e" }}>{term}</span>
          <p className="text-sm leading-relaxed mt-1 font-body" style={{ color: "#5a3a10" }}>{meaning}</p>
        </div>
      </div>
    </div>
  );
}

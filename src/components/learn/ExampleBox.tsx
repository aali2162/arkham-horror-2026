interface ExampleBoxProps {
  title: string;
  narrative: string;
  breakdown?: string[];
}

export default function ExampleBox({ title, narrative, breakdown }: ExampleBoxProps) {
  return (
    <div className="example-box">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 mt-0.5 opacity-80">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#2e8a50" }}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-heading font-semibold text-sm mb-1" style={{ color: "#1a5030" }}>{title}</p>
          <p className="text-sm leading-relaxed font-body" style={{ color: "#5a3a10" }}>{narrative}</p>
          {breakdown && breakdown.length > 0 && (
            <ul className="mt-2 space-y-1">
              {breakdown.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs font-body" style={{ color: "#6a5030" }}>
                  <span style={{ color: "#2e8a50" }}>›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

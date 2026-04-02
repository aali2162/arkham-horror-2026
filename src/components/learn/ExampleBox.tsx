interface ExampleBoxProps {
  title?: string;
  narrative: string;
  breakdown?: string[];
}

export default function ExampleBox({ title, narrative, breakdown }: ExampleBoxProps) {
  return (
    <div className="example-box">
      <div className="flex items-start gap-3">
        <span className="text-ark-green text-lg mt-0.5">🧪</span>
        <div className="flex-1">
          {title && (
            <p className="font-bold text-ark-green text-sm uppercase tracking-wide mb-2">
              {title}
            </p>
          )}
          <p className="text-ark-text text-[15px] leading-relaxed">{narrative}</p>
          {breakdown && breakdown.length > 0 && (
            <div className="mt-3 bg-ark-bg/50 rounded-lg p-3 font-mono text-sm space-y-1">
              {breakdown.map((line, i) => (
                <div key={i} className="text-ark-text-dim">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

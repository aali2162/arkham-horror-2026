interface StepCardProps {
  number: number;
  title: string;
  description: string;
  note?: string;
}

export default function StepCard({ number, title, description, note }: StepCardProps) {
  return (
    <div className="flex gap-4 py-5 transition-all duration-200 group"
      style={{ borderBottom: "1px solid #2e2318" }}>
      <div className="step-number flex-shrink-0">{number}</div>
      <div className="flex-1">
        <h3 className="font-decorative font-semibold text-base text-ark-text mb-1.5 group-hover:text-ark-gold transition-colors"
          style={{ color: "#e8dcc8" }}>
          {title}
        </h3>
        <p className="text-ark-text-dim text-sm leading-relaxed">{description}</p>
        {note && (
          <p className="mt-2 text-xs italic" style={{ color: "#8a6030" }}>{note}</p>
        )}
      </div>
    </div>
  );
}

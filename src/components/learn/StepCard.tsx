interface StepCardProps {
  number: number;
  title: string;
  detail: string;
  note?: string;
}

export default function StepCard({ number, title, detail, note }: StepCardProps) {
  return (
    <div className="flex gap-4 py-5 transition-all duration-200 group"
      style={{ borderBottom: "1px solid rgba(138,104,32,0.2)" }}>
      <div className="step-number flex-shrink-0">{number}</div>
      <div className="flex-1">
        <h3 className="font-heading font-semibold text-base mb-1.5 transition-colors"
          style={{ color: "#2a1808" }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed font-body" style={{ color: "#5a3a10" }}>{detail}</p>
        {note && (
          <p className="mt-2 text-xs italic font-flavour" style={{ color: "#8a6820" }}>{note}</p>
        )}
      </div>
    </div>
  );
}

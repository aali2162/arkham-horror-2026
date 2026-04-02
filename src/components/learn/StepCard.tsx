interface StepCardProps {
  number: number;
  title: string;
  detail: string;
}

export default function StepCard({ number, title, detail }: StepCardProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="step-number">{number}</div>
      <div className="flex-1 pt-1">
        <h4 className="font-display font-bold text-ark-text text-base mb-1">
          {title}
        </h4>
        <p className="text-ark-text-dim text-[15px] leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

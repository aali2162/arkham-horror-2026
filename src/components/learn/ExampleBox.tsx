interface ExampleBoxProps {
  title: string;
  narrative: string;
}

export default function ExampleBox({ title, narrative }: ExampleBoxProps) {
  return (
    <div className="example-box">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-lg mt-0.5">📖</div>
        <div>
          <p className="font-decorative font-semibold text-sm mb-1" style={{ color: "#5bc898" }}>{title}</p>
          <p className="text-ark-text-dim text-sm leading-relaxed">{narrative}</p>
        </div>
      </div>
    </div>
  );
}

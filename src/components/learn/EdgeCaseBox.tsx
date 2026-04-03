interface EdgeCaseBoxProps {
  question: string;
  answer: string;
}

export default function EdgeCaseBox({ question, answer }: EdgeCaseBoxProps) {
  return (
    <div className="edge-case-box">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-lg mt-0.5">⚠️</div>
        <div>
          <p className="font-decorative font-semibold text-sm mb-1" style={{ color: "#e8a830" }}>{question}</p>
          <p className="text-ark-text-dim text-sm leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

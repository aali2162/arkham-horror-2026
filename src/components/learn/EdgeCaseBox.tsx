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
          <p className="font-heading font-semibold text-sm mb-1" style={{ color: "#7a5010" }}>{question}</p>
          <p className="text-sm leading-relaxed font-body" style={{ color: "#5a3a10" }}>{answer}</p>
        </div>
      </div>
    </div>
  );
}

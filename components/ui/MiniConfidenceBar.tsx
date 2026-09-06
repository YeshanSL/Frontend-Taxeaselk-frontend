// A short inline bar + percentage, used for "AI Confidence" in the
// Documents table. Color-coded based on confidence thresholds:
// >= 90% (Green / Processed), 70-89% (Amber / Review Required), < 70% (Red / Critical)
export default function MiniConfidenceBar({ percent }: { percent: number }) {
  const barColor =
    percent >= 90
      ? "bg-emerald-500"
      : percent >= 70
      ? "bg-amber-500"
      : "bg-red-500";

  const textColor =
    percent >= 90
      ? "text-emerald-700"
      : percent >= 70
      ? "text-amber-700"
      : "text-red-700";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${textColor}`}>{percent}%</span>
    </div>
  );
}

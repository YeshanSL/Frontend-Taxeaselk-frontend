// A short inline bar + percentage, used for "AI Confidence" in the
// Documents table. Deliberately compact — different from the full-width
// ProgressBar used on the Dashboard.
export default function MiniConfidenceBar({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-brand-blue"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{percent}%</span>
    </div>
  );
}

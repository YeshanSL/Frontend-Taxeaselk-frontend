import clsx from "clsx";

// Horizontal progress bar used on the Dashboard ("87% Complete"),
// Review Queue, and Auditor Review pages.
export default function ProgressBar({
  value,
  colorClassName = "bg-brand-blue",
}: {
  value: number; // 0-100
  colorClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-gray-200">
      <div
        className={clsx("h-2 rounded-full transition-all", colorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

import Badge, { BadgeTone } from "@/components/ui/Badge";

// One row of the "Review Summary" card: a label on the left, a colored
// count pill on the right (e.g. "Approved  12").
export default function SummaryCountRow({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: BadgeTone;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <Badge tone={tone}>{count}</Badge>
    </div>
  );
}

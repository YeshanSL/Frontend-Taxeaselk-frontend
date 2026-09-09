import { ReactNode } from "react";
import Card from "./Card";

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  valueClassName?: string;
}

// Small metric tile: "Documents / 7 / 10 / 3 pending upload" style cards
// seen across the Dashboard, Documents, and Financials pages.
export default function StatCard({
  label,
  value,
  hint,
  valueClassName,
}: StatCardProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold text-gray-900 ${valueClassName ?? ""}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </Card>
  );
}

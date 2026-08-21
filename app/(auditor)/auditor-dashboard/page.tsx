import { LayoutGrid } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function AuditorDashboardPage() {
  return (
    <ComingSoon
      title="Auditor Dashboard"
      description="Companies assigned, pending reviews, and priority items at a glance."
      icon={LayoutGrid}
      day="Day 8"
    />
  );
}

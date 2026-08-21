import { AlertTriangle } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function IssuesPage() {
  return (
    <ComingSoon
      title="Issues"
      description="Review and resolve issues across all assigned companies."
      icon={AlertTriangle}
      day="Day 10"
    />
  );
}

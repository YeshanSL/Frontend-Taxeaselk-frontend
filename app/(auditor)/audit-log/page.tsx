import { History } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function AuditLogPage() {
  return (
    <ComingSoon
      title="Audit Log"
      description="Immutable history of actions performed within the tax review."
      icon={History}
      day="Day 10"
    />
  );
}

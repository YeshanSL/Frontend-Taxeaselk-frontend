import { UserCheck } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function AuditorReviewPage() {
  return (
    <ComingSoon
      title="Auditor Review"
      description="Track the status with the assigned auditor."
      icon={UserCheck}
      day="Day 7"
    />
  );
}

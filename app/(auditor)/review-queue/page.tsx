import { ClipboardList } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function ReviewQueuePage() {
  return (
    <ComingSoon
      title="Review Queue"
      description="Review CIT computations submitted by assigned companies."
      icon={ClipboardList}
      day="Day 9"
    />
  );
}

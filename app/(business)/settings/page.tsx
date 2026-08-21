import { Settings } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function BusinessSettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Manage your company profile, users, and security settings."
      icon={Settings}
      day="Day 7"
    />
  );
}

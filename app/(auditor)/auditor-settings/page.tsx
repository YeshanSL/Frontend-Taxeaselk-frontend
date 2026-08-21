import { Settings } from "lucide-react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function AuditorSettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Manage your profile, security, and notification preferences."
      icon={Settings}
      day="Day 11"
    />
  );
}

"use client";

import { useState, ReactNode } from "react";
import clsx from "clsx";
import Card from "@/components/ui/Card";

const TABS = ["Profile", "Security", "Notifications", "Preferences"] as const;
type Tab = (typeof TABS)[number];

// Same tabs-over-a-card pattern as the business SettingsTabs component.
// Only "Profile" has real content today, matching what's in the Figma
// export; the others render a short placeholder.
export default function AuditorSettingsTabs({
  profileTabContent,
}: {
  profileTabContent: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");

  return (
    <div>
      <div className="mb-4 flex gap-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {activeTab === "Profile" ? (
          profileTabContent
        ) : (
          <p className="py-10 text-center text-sm text-gray-400">
            {activeTab} settings — coming soon.
          </p>
        )}
      </Card>
    </div>
  );
}

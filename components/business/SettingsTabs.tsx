"use client";

import { useState, ReactNode } from "react";
import clsx from "clsx";
import Card from "@/components/ui/Card";
import UsersTab from "./UsersTab";

// Figma's Settings screen has a "Users" tab appearing twice with a
// "Notifications" label rendered underneath it — a layout overlap in
// the source file, not an intentional 6th tab. Rebuilt here as 5
// distinct tabs: Company, Users, Security, Notifications, Audit Log.
const TABS = ["Company", "Users", "Security", "Notifications", "Audit Log"] as const;
type Tab = (typeof TABS)[number];

// Only "Company" has real content today (per the Figma export). The
// other tabs show a short placeholder so the tab bar is fully
// clickable without pretending those forms already exist.
export default function SettingsTabs({ companyTabContent }: { companyTabContent: ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("Company");

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>



      <Card className="p-6">
        {activeTab === "Company" ? (
          companyTabContent
        ) : activeTab === "Users" ? (
          <UsersTab />
        ) : (
          <p className="py-10 text-center text-sm text-gray-400">
            {activeTab} settings — coming soon.
          </p>
        )}
      </Card>
    </div>
  );
}

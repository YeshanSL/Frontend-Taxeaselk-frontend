import SettingsTabs from "@/components/business/SettingsTabs";
import CompanySettingsForm from "@/components/business/CompanySettingsForm";
import T from "@/components/layout/T";
import { getCompanySettings } from "@/lib/api/business";

// Matches the "Settings" Figma screen. The tab bar is a Client
// Component (needs local state); the Company form's initial values are
// fetched here on the server and passed down.
export default async function BusinessSettingsPage() {
  const settings = await getCompanySettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        <T k="pages.settings.title" />
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        <T k="pages.settings.subtitle" />
      </p>

      <div className="mt-6">
        <SettingsTabs
          companyTabContent={<CompanySettingsForm initial={settings} />}
        />
      </div>
    </div>
  );
}

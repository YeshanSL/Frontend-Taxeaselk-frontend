import SettingsTabs from "@/components/business/SettingsTabs";
import CompanySettingsForm from "@/components/business/CompanySettingsForm";
import T from "@/components/layout/T";
import { getCompanyFullSettings } from "@/lib/api/business";

// Comprehensive Business Settings Suite for Sri Lanka Corporate Taxpayers
export default async function BusinessSettingsPage() {
  const fullSettings = await getCompanyFullSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          <T k="pages.settings.title" />
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          <T k="pages.settings.subtitle" />
        </p>
      </div>

      <div>
        <SettingsTabs
          companyTabContent={<CompanySettingsForm initial={fullSettings.profile} />}
          fullSettings={fullSettings}
        />
      </div>
    </div>
  );
}

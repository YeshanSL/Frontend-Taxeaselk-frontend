import AuditorSettingsTabs from "@/components/auditor/AuditorSettingsTabs";
import AuditorProfileForm from "@/components/auditor/AuditorProfileForm";
import T from "@/components/layout/T";
import { getAuditorFullSettings } from "@/lib/api/auditor";

export default async function AuditorSettingsPage() {
  const settings = await getAuditorFullSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        <T k="pages.settings.title" />
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your Chartered Accountant credentials, firm team, audit preferences, and security policies.
      </p>

      <div className="mt-6">
        <AuditorSettingsTabs
          initial={settings}
          profileTabContent={<AuditorProfileForm initial={settings.profile} />}
        />
      </div>
    </div>
  );
}

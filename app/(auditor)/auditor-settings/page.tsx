import AuditorSettingsTabs from "@/components/auditor/AuditorSettingsTabs";
import AuditorProfileForm from "@/components/auditor/AuditorProfileForm";
import T from "@/components/layout/T";
import { getAuditorProfileSettings } from "@/lib/api/auditor";

// Matches the auditor "Settings" Figma screen.
export default async function AuditorSettingsPage() {
  const profile = await getAuditorProfileSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        <T k="pages.settings.title" />
      </h1>

      <div className="mt-6">
        <AuditorSettingsTabs
          profileTabContent={<AuditorProfileForm initial={profile} />}
        />
      </div>
    </div>
  );
}

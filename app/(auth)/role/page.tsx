import Link from "next/link";
import { Building2, ShieldCheck, ChevronLeft } from "lucide-react";
import AuthBrandPanel from "@/components/layout/AuthBrandPanel";

// Matches the "Choose your role" Figma screen. Each option links straight
// to that role's sign-up flow, since a role is chosen before an account
// exists.
export default function ChooseRolePage() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <AuthBrandPanel />

      <div className="flex flex-col justify-center px-8 py-12 md:px-20">
        <Link
          href="/sign-in"
          className="mb-8 inline-flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="mb-8 text-3xl font-extrabold text-brand-navy">
          Choose your role
        </h1>

        <div className="flex flex-col gap-4">
          <RoleOption
            href="/sign-up/business"
            title="Business Owner"
            quote="File your Pvt Ltd company income tax file"
            icon={<Building2 className="h-6 w-6 text-gray-400" />}
          />
          <RoleOption
            href="/sign-up/auditor"
            title="Auditor"
            quote="Review and approved your client companies Income tax files"
            icon={<ShieldCheck className="h-6 w-6 text-gray-400" />}
          />
        </div>
      </div>
    </div>
  );
}

function RoleOption({
  href,
  title,
  quote,
  icon,
}: {
  href: string;
  title: string;
  quote: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-gray-200 p-5 text-left transition-colors hover:border-brand-blue hover:bg-blue-50/40"
    >
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-gray-500">&ldquo;{quote}&rdquo;</p>
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200">
        {icon}
      </div>
    </Link>
  );
}

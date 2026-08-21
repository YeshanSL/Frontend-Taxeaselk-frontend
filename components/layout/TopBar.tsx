import { Bell, HelpCircle, Search, ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface TopBarProps {
  // Left-side content differs per portal: company + FY pickers for the
  // Business view, "All Companies" + year pickers for the Auditor view.
  leftContent: ReactNode;
  roleLabel: string; // "Admin" or "Auditor"
  userInitials: string;
}

export default function TopBar({
  leftContent,
  roleLabel,
  userInitials,
}: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div className="flex items-center gap-3">{leftContent}</div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search"
            className="w-56 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
        <button
          aria-label="Notifications"
          className="text-gray-400 hover:text-gray-600"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button aria-label="Help" className="text-gray-400 hover:text-gray-600">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
            {userInitials}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {roleLabel}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </header>
  );
}

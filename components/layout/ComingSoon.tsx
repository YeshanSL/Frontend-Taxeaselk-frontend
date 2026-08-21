import { LucideIcon } from "lucide-react";

// Temporary placeholder shown for pages not yet built out (see the
// roadmap — each of these gets replaced on its scheduled day).
// Once a real page is built, delete the matching placeholder usage.
export default function ComingSoon({
  title,
  description,
  icon: Icon,
  day,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  day: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{description}</p>

      <div className="mt-10 flex flex-col items-center justify-center rounded-card border border-dashed border-gray-300 bg-white py-20 text-center">
        <Icon className="h-10 w-10 text-gray-300" />
        <p className="mt-3 font-semibold text-gray-700">
          {title} — built on {day}
        </p>
        <p className="mt-1 max-w-sm text-sm text-gray-400">
          This screen is on the roadmap. The layout, sidebar, and data
          pattern are already wired up — only this page&apos;s content is
          left.
        </p>
      </div>
    </div>
  );
}

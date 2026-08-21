import clsx from "clsx";

// The "TE" mark + wordmark used on auth screens and both sidebars.
export default function Logo({
  light = false,
  size = "md",
}: {
  light?: boolean; // true = white text (for the navy panel), false = navy text
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={clsx(
          "flex items-center justify-center rounded-md bg-gradient-to-br from-brand-navy to-brand-blue font-black text-white",
          size === "md" ? "h-9 w-9 text-lg" : "h-7 w-7 text-sm"
        )}
      >
        TE
      </div>
      <span
        className={clsx(
          "font-extrabold tracking-tight",
          size === "md" ? "text-xl" : "text-base",
          light ? "text-white" : "text-brand-navy"
        )}
      >
        TaxEaseLK
      </span>
    </div>
  );
}

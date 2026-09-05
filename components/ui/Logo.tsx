import Image from "next/image";
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
    <div className="flex items-center gap-2.5">
      <div
        className={clsx(
          "relative flex items-center justify-center shrink-0",
          size === "md" ? "h-9 w-9" : "h-7 w-7"
        )}
      >
        <Image
          src="/images/logo-mark.png"
          alt="TaxEaseLK Logo"
          fill
          sizes={size === "md" ? "36px" : "28px"}
          className="object-contain"
        />
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

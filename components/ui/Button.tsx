import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

// A single Button component used everywhere in the app.
// "variant" controls the color/style, so every screen stays consistent
// instead of each page inventing its own button classes.
type Variant = "primary" | "secondary" | "success" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand-blue text-white hover:bg-brand-blue-dark",
  secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
  success: "bg-status-success text-white hover:opacity-90",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  danger: "bg-status-critical text-white hover:opacity-90",
};

export default function Button({
  variant = "primary",
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

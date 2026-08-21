import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// The white rounded box used for every panel in the app
// (stat cards, tables, forms, etc). One place to tweak the look.
export default function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-card border border-gray-100 bg-white shadow-card",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

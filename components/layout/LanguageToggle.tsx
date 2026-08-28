"use client";

import clsx from "clsx";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGE_LABELS, Language } from "@/lib/i18n/translations";

const LANGUAGES: Language[] = ["en", "si", "ta"];

// The EN / සිං / தமி segmented switch shown in the top bar of both
// portals, next to the company/FY (or All Companies) pickers.
export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
      <Languages className="ml-1 h-3.5 w-3.5 text-gray-400" />
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          className={clsx(
            "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
            language === lang
              ? "bg-white text-brand-blue shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}

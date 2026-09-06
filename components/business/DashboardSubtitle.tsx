"use client";

import { useEffect, useState } from "react";

interface Props {
  initialCompanyName?: string;
  initialFinancialYear?: string;
}

export default function DashboardSubtitle({
  initialCompanyName = "ABC (Pvt) Ltd",
  initialFinancialYear = "2025/26",
}: Props) {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [financialYear, setFinancialYear] = useState(initialFinancialYear);

  useEffect(() => {
    function syncFromStorage() {
      try {
        const saved = localStorage.getItem("taxease_company_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.companyName) {
            setCompanyName(parsed.companyName);
          }
          if (parsed.financialYear) {
            setFinancialYear(parsed.financialYear);
          }
          return;
        }

        const savedUser = localStorage.getItem("taxease_user");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          const name = u.company_name || u.display_name || u.companyName;
          if (name) {
            setCompanyName(name);
          }
        }
      } catch {
        // Ignored
      }
    }

    syncFromStorage();

    window.addEventListener("taxease_company_updated", syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("taxease_company_updated", syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const cleanFy = financialYear.replace(/^FY\s*/i, "").trim();

  return (
    <p className="mt-1 text-sm text-gray-500">
      Financial Year {cleanFy || "2025/26"} &mdash; {companyName || "ABC (Pvt) Ltd"}
    </p>
  );
}


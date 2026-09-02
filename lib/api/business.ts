const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getDashboardSummary() {
  const response = await fetch(`${API_URL}/business/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  const backendData = await response.json();

  return {
    progressPercent: backendData.progress,

    progressUpdatedAt: "Just now",

    steps: [],

    documentsUploaded: backendData.documents.uploaded,
    documentsTotal: backendData.documents.total,

    accountingProfit: backendData.accounting_profit,
    taxableIncome: backendData.taxable_income,
    estCitLiability: backendData.estimated_cit,

    auditorStatus: backendData.auditor_status,

    attentionItems: [],
  };
}
// All UI copy that's wrapped in <T k="..." /> or read via useLanguage()'s
// t() function lives here, one flat-ish object per language. Keys are
// dot-namespaced by area (common.*, sidebar.*, pages.*) purely for
// readability — there's no nesting logic, just naming convention.
//
// Scope note: this covers navigation chrome (sidebar, top bar) and every
// page's title + subtitle — the parts of the UI that are pure static
// copy. Table contents, mock company names, and document names are data
// (will come from the FastAPI backend, possibly already localized there)
// rather than UI strings, so they're intentionally left untranslated for
// now. Add new keys here the same way as you build out more of the app.

export type Language = "en" | "si" | "ta";

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "EN",
  si: "සිං",
  ta: "தமி",
};

export const translations = {
  en: {
    "common.search": "Search",
    "common.notifications": "Notifications",
    "common.noNotifications": "You're all caught up.",
    "common.markAllRead": "Mark all as read",
    "common.viewAll": "View all",
    "common.help": "Help",
    "common.profile": "Profile",
    "common.settings": "Settings",
    "common.logout": "Logout",
    "common.allCompanies": "All Companies",

    "sidebar.navigation": "Navigation",
    "sidebar.dashboard": "Dashboard",
    "sidebar.documents": "Documents",
    "sidebar.financials": "Financials",
    "sidebar.auditorReview": "Auditor Review",
    "sidebar.settings": "Settings",
    "sidebar.companies": "Companies",
    "sidebar.reviewQueue": "Review Queue",
    "sidebar.requests": "Requests",
    "sidebar.discussions": "Discussions",
    "sidebar.issues": "Issues",
    "sidebar.auditLog": "Audit Log",
    "sidebar.companyUser": "Company User",
    "sidebar.auditorWorkspace": "Auditor Workspace",

    "pages.dashboard.title": "Income Tax Dashboard",
    "pages.dashboard.subtitle": "Financial Year 2025/26 — ABC (Pvt) Ltd",
    "pages.documents.title": "Documents",
    "pages.documents.subtitle":
      "Manage financial documents used for Corporate Income Tax preparation.",
    "pages.auditorDocuments.title": "Client Documents",
    "pages.auditorDocuments.subtitle": "Review and verify financial documents uploaded by assigned companies.",
    "pages.financials.title": "Financials",
    "pages.financials.subtitle":
      "Review the structured financial information extracted from your documents.",
    "pages.auditorReview.title": "Auditor Review",
    "pages.auditorReview.subtitle": "Track the status with the assigned Auditor.",
    "pages.settings.title": "Settings",
    "pages.settings.subtitle": "Manage your company profile and preferences.",
    "pages.companies.title": "Companies",
    "pages.companies.subtitle":
      "Manage companies assigned to you for Corporate Income Tax review.",
    "pages.reviewQueue.title": "Review Queue",
    "pages.reviewQueue.subtitle":
      "Review CIT computations submitted by assigned companies.",
    "pages.requests.title": "Requests",
    "pages.requests.subtitle": "Manage document and clarification requests sent to companies.",
    "pages.discussions.title": "Discussions",
    "pages.discussions.subtitle": "Direct audit discussion threads and clarifications with client companies.",
    "pages.issues.title": "Issues",
    "pages.issues.subtitle": "Review and resolve issues across all assigned companies.",
    "pages.auditLog.title": "Audit Log",
    "pages.auditLog.subtitle":
      "Immutable history of actions performed within the tax review.",
  },
  si: {
    "common.search": "සොයන්න",
    "common.notifications": "දැනුම්දීම්",
    "common.noNotifications": "නව දැනුම්දීම් නැත.",
    "common.markAllRead": "සියල්ල කියවූ බව සලකුණු කරන්න",
    "common.viewAll": "සියල්ල බලන්න",
    "common.help": "උදව්",
    "common.profile": "පැතිකඩ",
    "common.settings": "සැකසුම්",
    "common.logout": "ඉවත් වන්න",
    "common.allCompanies": "සියලුම සමාගම්",

    "sidebar.navigation": "සංචලනය",
    "sidebar.dashboard": "උපකරණ පුවරුව",
    "sidebar.documents": "ලේඛන",
    "sidebar.financials": "මූල්‍ය තොරතුරු",
    "sidebar.auditorReview": "විගණක සමාලෝචනය",
    "sidebar.settings": "සැකසුම්",
    "sidebar.companies": "සමාගම්",
    "sidebar.reviewQueue": "සමාලෝචන පෝලිම",
    "sidebar.requests": "ඉල්ලීම්",
    "sidebar.discussions": "සාකච්ඡා",
    "sidebar.issues": "ගැටළු",
    "sidebar.auditLog": "විගණන ලේඛනය",
    "sidebar.companyUser": "සමාගම් පරිශීලක",
    "sidebar.auditorWorkspace": "විගණක වැඩබිම",

    "pages.dashboard.title": "ආදායම් බදු උපකරණ පුවරුව",
    "pages.dashboard.subtitle": "මූල්‍ය වර්ෂය 2025/26 — ABC (Pvt) Ltd",
    "pages.documents.title": "ලේඛන",
    "pages.documents.subtitle":
      "සංස්ථාගත ආදායම් බදු සකස් කිරීම සඳහා භාවිත වන මූල්‍ය ලේඛන කළමනාකරණය කරන්න.",
    "pages.auditorDocuments.title": "සේවාදායක ලේඛන",
    "pages.auditorDocuments.subtitle": "පවරන ලද සමාගම් විසින් උඩුගත කරන ලද මූල්‍ය ලේඛන සමාලෝචනය සහ තහවුරු කිරීම.",
    "pages.financials.title": "මූල්‍ය තොරතුරු",
    "pages.financials.subtitle":
      "ඔබේ ලේඛනවලින් උපුටාගත් සංයුක්ත මූල්‍ය තොරතුරු සමාලෝචනය කරන්න.",
    "pages.auditorReview.title": "විගණක සමාලෝචනය",
    "pages.auditorReview.subtitle": "පවරන ලද විගණකවරයා සමඟ තත්ත්වය නිරීක්ෂණය කරන්න.",
    "pages.settings.title": "සැකසුම්",
    "pages.settings.subtitle": "ඔබේ සමාගම් පැතිකඩ සහ අභිප්‍රේත සකසන්න.",
    "pages.companies.title": "සමාගම්",
    "pages.companies.subtitle":
      "සංස්ථාගත ආදායම් බදු සමාලෝචනය සඳහා ඔබට පවරන ලද සමාගම් කළමනාකරණය කරන්න.",
    "pages.reviewQueue.title": "සමාලෝචන පෝලිම",
    "pages.reviewQueue.subtitle": "පවරන ලද සමාගම් විසින් ඉදිරිපත් කළ CIT ගණනය කිරීම් සමාලෝචනය කරන්න.",
    "pages.requests.title": "ඉල්ලීම්",
    "pages.requests.subtitle": "සේවාදායක සමාගම් වෙත ඉදිරිපත් කරන ලද ලේඛන සහ තොරතුරු ඉල්ලීම් කළමනාකරණය කරන්න.",
    "pages.discussions.title": "සාකච්ඡා",
    "pages.discussions.subtitle": "සේවාදායක සමාගම් සමඟ සෘජු විගණන සාකච්ඡා සහ පැහැදිලි කිරීම්.",
    "pages.issues.title": "ගැටළු",
    "pages.issues.subtitle": "පවරන ලද සියලුම සමාගම් හරහා ගැටළු සමාලෝචනය කර විසඳන්න.",
    "pages.auditLog.title": "විගණන ලේඛනය",
    "pages.auditLog.subtitle": "බදු සමාලෝචනය තුළ සිදු කරන ලද ක්‍රියාවන්හි වෙනස් කළ නොහැකි ඉතිහාසය.",
  },
  ta: {
    "common.search": "தேடு",
    "common.notifications": "அறிவிப்புகள்",
    "common.noNotifications": "புதிய அறிவிப்புகள் இல்லை.",
    "common.markAllRead": "அனைத்தையும் படித்ததாகக் குறி",
    "common.viewAll": "அனைத்தையும் காண்க",
    "common.help": "உதவி",
    "common.profile": "சுயவிவரம்",
    "common.settings": "அமைப்புகள்",
    "common.logout": "வெளியேறு",
    "common.allCompanies": "அனைத்து நிறுவனங்களும்",

    "sidebar.navigation": "வழிசெலுத்தல்",
    "sidebar.dashboard": "டாஷ்போர்டு",
    "sidebar.documents": "ஆவணங்கள்",
    "sidebar.financials": "நிதி விவரங்கள்",
    "sidebar.auditorReview": "தணிக்கையாளர் மதிப்பாய்வு",
    "sidebar.settings": "அமைப்புகள்",
    "sidebar.companies": "நிறுவனங்கள்",
    "sidebar.reviewQueue": "மதிப்பாய்வு வரிசை",
    "sidebar.requests": "கோரிக்கைகள்",
    "sidebar.discussions": "விவாதங்கள்",
    "sidebar.issues": "சிக்கல்கள்",
    "sidebar.auditLog": "தணிக்கை பதிவு",
    "sidebar.companyUser": "நிறுவன பயனர்",
    "sidebar.auditorWorkspace": "தணிக்கையாளர் பணியிடம்",

    "pages.dashboard.title": "வருமான வரி டாஷ்போர்டு",
    "pages.dashboard.subtitle": "நிதியாண்டு 2025/26 — ABC (Pvt) Ltd",
    "pages.documents.title": "ஆவணங்கள்",
    "pages.documents.subtitle":
      "பொது வருமான வரி தயாரிப்புக்குப் பயன்படுத்தப்படும் நிதி ஆவணங்களை நிர்வகிக்கவும்.",
    "pages.auditorDocuments.title": "வாடிக்கையாளர் ஆவணங்கள்",
    "pages.auditorDocuments.subtitle": "ஒதுக்கப்பட்ட நிறுவனங்களால் பதிவேற்றப்பட்ட நிதி ஆவணங்களை மதிப்பாய்வு செய்து சரிபார்க்கவும்.",
    "pages.financials.title": "நிதி விவரங்கள்",
    "pages.financials.subtitle":
      "உங்கள் ஆவணங்களிலிருந்து பெறப்பட்ட கட்டமைக்கப்பட்ட நிதித் தகவலை மதிப்பாய்வு செய்யவும்.",
    "pages.auditorReview.title": "தணிக்கையாளர் மதிப்பாய்வு",
    "pages.auditorReview.subtitle": "நியமிக்கப்பட்ட தணிக்கையாளருடன் நிலையைக் கண்காணிக்கவும்.",
    "pages.settings.title": "அமைப்புகள்",
    "pages.settings.subtitle": "உங்கள் நிறுவன சுயவிவரம் மற்றும் விருப்பங்களை நிர்வகிக்கவும்.",
    "pages.companies.title": "நிறுவனங்கள்",
    "pages.companies.subtitle":
      "பொது வருமான வரி மதிப்பாய்வுக்காக உங்களுக்கு ஒதுக்கப்பட்ட நிறுவனங்களை நிர்வகிக்கவும்.",
    "pages.reviewQueue.title": "மதிப்பாய்வு வரிசை",
    "pages.reviewQueue.subtitle":
      "ஒதுக்கப்பட்ட நிறுவனங்களால் சமர்ப்பிக்கப்பட்ட CIT கணக்கீடுகளை மதிப்பாய்வு செய்யவும்.",
    "pages.requests.title": "கோரிக்கைகள்",
    "pages.requests.subtitle": "வாடிக்கையாளர் நிறுவனங்களுக்கு சமர்ப்பிக்கப்பட்ட ஆவணங்கள் மற்றும் தகவல் கோரிக்கைகளை நிர்வகிக்கவும்.",
    "pages.discussions.title": "விவாதங்கள்",
    "pages.discussions.subtitle": "வாடிக்கையாளர் நிறுவனங்களுடனான நேரடி தணிக்கை விவாதங்கள் மற்றும் விளக்கங்கள்.",
    "pages.issues.title": "சிக்கல்கள்",
    "pages.issues.subtitle": "ஒதுக்கப்பட்ட அனைத்து நிறுவனங்களிலும் உள்ள சிக்கல்களை மதிப்பாய்வு செய்து தீர்க்கவும்.",
    "pages.auditLog.title": "தணிக்கை பதிவு",
    "pages.auditLog.subtitle": "வரி மதிப்பாய்வுக்குள் செய்யப்பட்ட நடவடிக்கைகளின் மாற்ற முடியாத வரலாறு.",
  },
} as const satisfies Record<Language, Record<string, string>>;

export type TranslationKey = keyof (typeof translations)["en"];

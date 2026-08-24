// Matches "Loading screen.jpeg" from the Figma export: centered TE
// mark, gradient wordmark, animated progress bar underneath.
//
// This is rendered automatically by Next.js whenever a page in that
// route segment is fetching data (see the loading.tsx files next to
// this) — no wiring needed, App Router shows it for you during
// navigation and on first load.
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand-blue text-3xl font-black text-white shadow-lg">
        TE
      </div>
      <p className="mt-5 bg-gradient-to-r from-brand-navy to-brand-blue bg-clip-text text-3xl font-extrabold text-transparent">
        TaxEaseLK
      </p>
      <div className="mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full w-1/2 animate-loading-bar rounded-full bg-gradient-to-r from-brand-navy to-brand-blue" />
      </div>
    </div>
  );
}

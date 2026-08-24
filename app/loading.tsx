import LoadingScreen from "@/components/layout/LoadingScreen";

// Next.js automatically shows this while the root route is loading —
// e.g. the very first visit to the site. No manual triggering needed.
export default function RootLoading() {
  return <LoadingScreen />;
}

import LoadingScreen from "@/components/layout/LoadingScreen";

// Shown automatically whenever a page inside the (business) route group
// is fetching its data (e.g. clicking Dashboard -> Documents). This is
// a Next.js App Router convention — just having this file here is
// enough, nothing to call.
export default function BusinessLoading() {
  return <LoadingScreen />;
}

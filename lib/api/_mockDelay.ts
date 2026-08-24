// Simulates network latency in our mock data functions so the
// loading.tsx screens are actually visible during navigation/demo.
// DELETE THIS FILE (and its usages) once lib/api/*.ts call the real
// FastAPI backend — real requests will have their own latency.
export function simulateNetworkDelay(ms: number = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

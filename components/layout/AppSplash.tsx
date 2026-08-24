"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

const FADE_MS = 400;
const VISIBLE_MS = 900;

// Shows the TaxEaseLK splash (matches "Loading screen.jpeg" from the
// Figma export) exactly once — when the browser actually loads the
// app (first visit, or a hard refresh).
//
// This is mounted once in the root layout (app/layout.tsx). Next.js's
// App Router keeps the root layout mounted across client-side
// navigation (clicking a <Link>, sidebar nav, etc.) — only a full
// browser reload remounts it. So this component's local state is a
// reliable "have we shown the splash yet this page load?" flag: it
// can't fire again just from switching tabs in the sidebar.
//
// We deliberately do NOT use Next.js's loading.tsx convention here —
// that shows on every route segment that suspends while fetching data,
// which means it reappears on every navigation, not just app startup.
export default function AppSplash({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
    const removeTimer = setTimeout(() => setMounted(false), VISIBLE_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {children}
      {mounted && (
        <div
          aria-hidden={!visible}
          className={`fixed inset-0 z-50 bg-white transition-opacity ease-out ${
            visible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <LoadingScreen />
        </div>
      )}
    </>
  );
}

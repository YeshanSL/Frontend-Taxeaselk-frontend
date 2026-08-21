import Logo from "@/components/ui/Logo";

// The dark navy panel with decorative rings shown on every auth screen
// (Sign in, Sign up, Choose your role). Extracted into one component
// so we don't repeat the markup on every auth page.
export default function AuthBrandPanel() {
  return (
    <div className="relative hidden h-full min-h-screen w-full overflow-hidden bg-brand-navy md:flex md:flex-col md:items-center md:justify-center">
      {/* decorative rings, purely visual, mirrors the Figma background */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full border-[40px] border-white/5" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full border-[40px] border-white/5" />

      <div className="z-10 flex flex-col items-center gap-3 text-center">
        <Logo light size="md" />
        <p className="max-w-xs text-sm text-white/70">
          Over Companies Ditched Paperwork
          <br />
          We do it fast
        </p>
      </div>
    </div>
  );
}

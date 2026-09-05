import Image from "next/image";

// Displays the official TaxEaseLK logo mark, wordmark, and animated progress bar
// during page transitions and initial application load.
export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      {/* Official TE Logo Mark with controlled sizing */}
      <div className="relative h-24 w-24 md:h-28 md:w-28 drop-shadow-sm">
        <Image
          src="/images/logo-mark.png"
          alt="TaxEaseLK Logo"
          fill
          priority
          sizes="(min-width: 768px) 112px, 96px"
          className="object-contain"
        />
      </div>

      <p className="mt-5 bg-gradient-to-r from-brand-navy to-brand-blue bg-clip-text text-3xl font-extrabold text-transparent tracking-tight">
        TaxEaseLK
      </p>
      <div className="mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full w-1/2 animate-loading-bar rounded-full bg-gradient-to-r from-brand-navy to-brand-blue" />
      </div>
    </div>
  );
}

import Image from "next/image";

// Brand panel shown on auth screens (Sign in, Sign up, Choose your role, Forgot password).
// Displays the official TaxEaseLK brand hero illustration fixed directly to the screen margins.
export default function AuthBrandPanel() {
  return (
    <div className="relative hidden h-full min-h-screen w-full overflow-hidden bg-[#070b28] p-0 m-0 md:flex">
      <Image
        src="/images/auth-hero.svg"
        alt="TaxEaseLK - Simplify. Organize. Collaborate."
        fill
        priority
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover object-center"
      />
    </div>
  );
}


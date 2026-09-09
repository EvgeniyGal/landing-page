import Link from "next/link";
import { LogoYg } from "@/components/landing/logo-yg";
import { logoutAction } from "@/app/login/actions";

export function AppShell({
  email,
  role,
  children,
}: {
  email: string;
  role?: "admin" | "user";
  children: React.ReactNode;
}) {
  const initial = (email[0] || "U").toUpperCase();

  return (
    <div className="learner-app min-h-dvh bg-[#0c0c0c] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <nav className="flex items-center gap-6">
            <Link href="/app" className="text-[#7eb6ff]">
              <LogoYg className="h-7 w-auto" title="Home" />
            </Link>
            <Link href="/app" className="text-sm font-medium text-white underline decoration-[#4da3ff] underline-offset-8">
              Home
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {role === "admin" ? (
              <Link href="/admin" className="text-xs text-white/60 hover:text-white">
                Admin
              </Link>
            ) : null}
            <form action={logoutAction}>
              <button type="submit" className="text-xs text-white/60 hover:text-white">
                Sign out
              </button>
            </form>
            <div
              className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white"
              aria-hidden
            >
              {initial}
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

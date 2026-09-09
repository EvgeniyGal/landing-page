import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";

export const metadata = {
  title: "Study",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell email={session.user.email ?? ""} role={session.user.role}>
      {children}
    </AppShell>
  );
}

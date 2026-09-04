import { Toaster } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <>
      <AdminShell email={session.user.email ?? ""}>{children}</AdminShell>
      <Toaster richColors position="top-right" />
    </>
  );
}

import { InviteForm } from "./invite-form";

export const metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <InviteForm token={token} />
    </div>
  );
}

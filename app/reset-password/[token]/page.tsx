import { ResetPasswordForm } from "./reset-form";

export const metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <ResetPasswordForm token={token} />
    </div>
  );
}

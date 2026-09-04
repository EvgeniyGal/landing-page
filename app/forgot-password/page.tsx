import { ForgotPasswordForm } from "./forgot-form";

export const metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <ForgotPasswordForm />
    </div>
  );
}

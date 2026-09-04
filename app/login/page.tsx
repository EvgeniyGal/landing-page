import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <LoginForm />
    </div>
  );
}

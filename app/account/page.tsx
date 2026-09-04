import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No dashboard yet</CardTitle>
          <CardDescription>
            Your account is active. Flashcards are generated in Telegram after an admin sends you a
            connection link. A learner dashboard is not available yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-sm underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

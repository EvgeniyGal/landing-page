"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter your email and we will send a reset link if the account exists.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          {state?.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm">
            <Link href="/login" className="text-muted-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

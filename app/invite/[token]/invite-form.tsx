"use client";

import { useActionState } from "react";
import Link from "next/link";
import { acceptInviteAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteForm({ token }: { token: string }) {
  const action = acceptInviteAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Activate your account</CardTitle>
        <CardDescription>Set a password to finish joining.</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <p className="text-sm">
            Account activated.{" "}
            <Link href="/login" className="underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
            </div>
            {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Set password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

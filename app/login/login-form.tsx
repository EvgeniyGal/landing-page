"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Admin dashboard access. Invited users can activate from their email link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

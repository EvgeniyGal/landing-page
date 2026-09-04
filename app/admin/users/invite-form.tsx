"use client";

import { useActionState } from "react";
import { inviteUserAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteUserForm() {
  const [state, formAction, pending] = useActionState(inviteUserAction, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite user</CardTitle>
        <CardDescription>Accounts are invite-only. The user sets a password from the email link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_160px_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="user@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              name="role"
              defaultValue="user"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send invite"}
          </Button>
        </form>
        {state?.error ? <p className="mt-3 text-sm text-destructive">{state.error}</p> : null}
        {state?.success ? <p className="mt-3 text-sm text-muted-foreground">{state.success}</p> : null}
      </CardContent>
    </Card>
  );
}

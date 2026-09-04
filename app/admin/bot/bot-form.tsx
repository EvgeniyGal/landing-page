"use client";

import { useActionState } from "react";
import { saveBotTokenAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BotForm({
  configured,
  last4,
  username,
}: {
  configured: boolean;
  last4: string | null;
  username: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveBotTokenAction, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram bot</CardTitle>
        <CardDescription>
          {configured
            ? `Configured${last4 ? ` (…${last4})` : ""}${username ? ` — @${username}` : ""}. Paste a new token to replace it.`
            : "Paste a bot token from BotFather. The full token is stored encrypted and never shown again."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Bot token</Label>
            <Input id="token" name="token" type="password" autoComplete="off" required placeholder="123456:ABC..." />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-muted-foreground">{state.success}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Connecting…" : "Save and connect"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useActionState } from "react";
import { savePromptAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PromptForm({ prompt }: { prompt: string }) {
  const [state, formAction, pending] = useActionState(savePromptAction, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flashcard prompt</CardTitle>
        <CardDescription>
          Sent to OpenAI with each word. Use {"{{word}}"} to place the user text, or it will be appended automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea id="prompt" name="prompt" defaultValue={prompt} rows={22} required className="min-h-[320px] font-mono text-xs" />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-muted-foreground">{state.success}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save prompt"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

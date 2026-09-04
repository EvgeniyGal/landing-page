"use client";

import { useActionState } from "react";
import { saveOpenaiKeyAction, saveOpenaiModelAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OpenaiForms({
  configured,
  last4,
  models,
  selectedModel,
}: {
  configured: boolean;
  last4: string | null;
  models: string[];
  selectedModel: string | null;
}) {
  const [keyState, keyAction, keyPending] = useActionState(saveOpenaiKeyAction, null);
  const [modelState, modelAction, modelPending] = useActionState(saveOpenaiModelAction, null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API key</CardTitle>
          <CardDescription>
            {configured
              ? `Configured${last4 ? ` (…${last4})` : ""}. Paste a new key to replace it.`
              : "The key is stored encrypted and never shown in full after save."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={keyAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API key</Label>
              <Input id="apiKey" name="apiKey" type="password" autoComplete="off" required placeholder="sk-..." />
            </div>
            {keyState?.error ? <p className="text-sm text-destructive">{keyState.error}</p> : null}
            {keyState?.success ? <p className="text-sm text-muted-foreground">{keyState.success}</p> : null}
            <Button type="submit" disabled={keyPending}>
              {keyPending ? "Saving…" : "Save key"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Model</CardTitle>
          <CardDescription>Choose from models available to the saved key.</CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <p className="text-sm text-muted-foreground">Save a valid API key to load models.</p>
          ) : (
            <form action={modelAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">Chat model</Label>
                <select
                  id="model"
                  name="model"
                  defaultValue={selectedModel ?? models[0]}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              {modelState?.error ? <p className="text-sm text-destructive">{modelState.error}</p> : null}
              {modelState?.success ? <p className="text-sm text-muted-foreground">{modelState.success}</p> : null}
              <Button type="submit" disabled={modelPending}>
                {modelPending ? "Saving…" : "Save model"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

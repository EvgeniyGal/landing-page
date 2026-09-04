"use client";

import { useActionState, useTransition } from "react";
import {
  disconnectTelegramAction,
  generateConnectLinkAction,
  updateUserRoleAction,
  updateUserStatusAction,
} from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserRole, UserStatus } from "@/lib/db/schema";

export type UserRow = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  telegramUserId: string | null;
  telegramUsername: string | null;
};

function ConnectLinkForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(generateConnectLinkAction, null);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Creating…" : "Telegram link"}
      </Button>
      {state?.userId === userId && state.url ? (
        <p className="max-w-xs break-all text-xs text-muted-foreground">{state.url}</p>
      ) : null}
      {state?.userId === userId && state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Telegram</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email}</TableCell>
            <TableCell>
              <select
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                defaultValue={user.role}
                disabled={pending}
                onChange={(event) => {
                  startTransition(async () => {
                    await updateUserRoleAction(user.id, event.target.value as UserRole);
                  });
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </TableCell>
            <TableCell>
              <Badge variant={user.status === "active" ? "default" : user.status === "disabled" ? "destructive" : "secondary"}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              {user.telegramUserId ? (
                <span className="text-xs">
                  linked{user.telegramUsername ? ` (@${user.telegramUsername})` : ""}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">not linked</span>
              )}
            </TableCell>
            <TableCell className="space-y-2">
              <ConnectLinkForm userId={user.id} />
              <div className="flex flex-wrap gap-2">
                {user.status !== "disabled" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        await updateUserStatusAction(user.id, "disabled");
                      });
                    }}
                  >
                    Disable
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        await updateUserStatusAction(user.id, "active");
                      });
                    }}
                  >
                    Enable
                  </Button>
                )}
                {user.telegramUserId ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        await disconnectTelegramAction(user.id);
                      });
                    }}
                  >
                    Disconnect
                  </Button>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

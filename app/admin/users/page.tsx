import { InviteUserForm } from "./invite-form";
import { UsersTable } from "./users-table";
import { listUsers } from "./actions";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const users = await listUsers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Invite accounts, change roles, and generate Telegram connect links.</p>
      </div>
      <InviteUserForm />
      <UsersTable users={users} />
    </div>
  );
}

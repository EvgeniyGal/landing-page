"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, KeyRound, LayoutDashboard, LogOut, MessageSquareText, Users } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/bot", label: "Bot", icon: Bot },
  { href: "/admin/openai", label: "OpenAI", icon: KeyRound },
  { href: "/admin/prompt", label: "Prompt", icon: MessageSquareText },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/admin/users" className="flex items-center gap-2">
            <LayoutDashboard className="size-4" />
            <span className="font-display text-sm font-semibold tracking-wide">Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

import { and, eq, isNull } from "drizzle-orm";
import { hashToken } from "@/lib/crypto/tokens";
import { getDb } from "@/lib/db";
import { getOrCreateSettings } from "@/lib/db/settings";
import { telegramLinkTokens } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Connect Telegram",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ConnectTelegramPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = getDb();
  const settings = await getOrCreateSettings();
  const row = await db.query.telegramLinkTokens.findFirst({
    where: and(eq(telegramLinkTokens.tokenHash, hashToken(token)), isNull(telegramLinkTokens.usedAt)),
  });
  const valid = Boolean(row && row.expiresAt > new Date());
  const botUsername = settings.telegramBotUsername;
  const deepLink = botUsername ? `https://t.me/${botUsername}?start=${encodeURIComponent(token)}` : null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect Telegram</CardTitle>
          <CardDescription>
            {valid
              ? "Open the bot in Telegram to link your account. This link works once."
              : "This connection link is invalid or has expired. Ask an admin for a new one."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {valid && deepLink ? (
            <Button asChild className="w-full">
              <a href={deepLink}>Open Telegram</a>
            </Button>
          ) : null}
          {valid && !deepLink ? (
            <p className="text-sm text-muted-foreground">
              The Telegram bot is not configured yet. Ask an admin to save a bot token, then use a new link.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

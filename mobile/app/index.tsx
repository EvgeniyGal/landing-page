import { Redirect } from "expo-router";
import { LoadingBlock } from "@/src/components/ui";
import { useAuth } from "@/src/auth/session";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingBlock label="Starting…" />;
  }

  if (user) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/login" />;
}

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useRef } from "react";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn(onIdToken: (idToken: string) => void, onError: (message: string) => void) {
  const onIdTokenRef = useRef(onIdToken);
  const onErrorRef = useRef(onError);
  onIdTokenRef.current = onIdToken;
  onErrorRef.current = onError;

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim();
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

  const enabled = Boolean(webClientId);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId ?? "missing-web-client-id",
    androidClientId: androidClientId ?? webClientId ?? "missing-android-client-id",
    iosClientId: iosClientId ?? webClientId ?? "missing-ios-client-id",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken ?? response.params?.id_token;
      if (typeof idToken === "string" && idToken.length > 0) {
        onIdTokenRef.current(idToken);
        return;
      }
      onErrorRef.current("Google did not return a sign-in token.");
      return;
    }
    if (response?.type === "error") {
      onErrorRef.current(response.error?.message ?? "Google sign-in failed.");
    }
  }, [response]);

  return useMemo(
    () => ({
      enabled,
      ready: enabled && Boolean(request),
      promptAsync: () => promptAsync(),
    }),
    [enabled, request, promptAsync],
  );
}

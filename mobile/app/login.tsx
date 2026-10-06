import { Redirect, router } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGoogleSignIn } from "@/src/auth/google-sign-in";
import { useAuth } from "@/src/auth/session";
import { ErrorText, Field, LoadingBlock, PrimaryButton, SecondaryButton, Title } from "@/src/components/ui";
import { messageFromError } from "@/src/lib/format";
import { colors } from "@/src/theme";

export default function LoginScreen() {
  const { user, loading, login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGoogleToken = useCallback(
    async (idToken: string) => {
      setError(null);
      setSubmitting(true);
      try {
        await loginWithGoogle(idToken);
        router.replace("/(app)");
      } catch (err) {
        setError(messageFromError(err, "Google sign-in failed."));
      } finally {
        setSubmitting(false);
      }
    },
    [loginWithGoogle],
  );

  const onGoogleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const google = useGoogleSignIn(onGoogleToken, onGoogleError);

  if (loading) {
    return <LoadingBlock />;
  }

  if (user) {
    return <Redirect href="/(app)" />;
  }

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/(app)");
    } catch (err) {
      setError(messageFromError(err, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Text style={styles.logo}>Flashcards</Text>
            <Title>Sign in</Title>
            <Text style={styles.subtitle}>Use your invited account email and password.</Text>
          </View>

          <View style={styles.form}>
            <Field
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <Field
              secureTextEntry
              autoComplete="password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
            />
            <ErrorText>{error}</ErrorText>
            <PrimaryButton
              label="Sign in"
              loading={submitting}
              disabled={!email.trim() || !password}
              onPress={() => void onSubmit()}
            />
            {google.enabled ? (
              <SecondaryButton
                label="Continue with Google"
                loading={submitting}
                disabled={!google.ready || submitting}
                onPress={() => void google.promptAsync()}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 28,
  },
  brand: {
    gap: 8,
  },
  logo: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  form: {
    gap: 12,
  },
});

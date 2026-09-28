import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/session";
import { ErrorText, Field, LoadingBlock, PrimaryButton, Title } from "@/src/components/ui";
import { messageFromError } from "@/src/lib/format";
import { colors } from "@/src/theme";

export default function LoginScreen() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
    justifyContent: "center",
    padding: 24,
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

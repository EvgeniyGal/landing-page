import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError } from "@/src/api/types";
import { getMe, login as loginRequest, loginWithGoogle as loginWithGoogleRequest } from "@/src/api/endpoints";
import { setAuthToken, setUnauthorizedHandler } from "@/src/api/client";
import type { User } from "@/src/api/types";

const TOKEN_KEY = "flashcards_access_token";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readStoredToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function writeStoredToken(token: string | null) {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // SecureStore can fail on some web/dev targets; in-memory token still works for the session.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await writeStoredToken(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const result = await getMe();
    setUser(result.user);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = await readStoredToken();
      if (!stored) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      setAuthToken(stored);
      setToken(stored);
      try {
        const result = await getMe();
        if (!cancelled) {
          setUser(result.user);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearSession();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email.trim().toLowerCase(), password);
    setAuthToken(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
    await writeStoredToken(result.accessToken);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const result = await loginWithGoogleRequest(idToken);
    setAuthToken(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
    await writeStoredToken(result.accessToken);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, token, loading, login, loginWithGoogle, logout, refreshMe }),
    [user, token, loading, login, loginWithGoogle, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

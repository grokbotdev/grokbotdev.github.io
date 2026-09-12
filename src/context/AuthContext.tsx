import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { authenticateDemo } from "../lib/demoStore";
import { dataModeLabel } from "../lib/firebase";
import type { PublicUser } from "../types";

const SESSION_KEY = "aeoa-pgr-session";

function readSession(): PublicUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  } catch {
    return null;
  }
}

type AuthContextValue = {
  user: PublicUser | null;
  mode: ReturnType<typeof dataModeLabel>;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(readSession);
  const mode = dataModeLabel();

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      mode,
      login(email, password) {
        const matched = authenticateDemo(email, password);
        if (!matched) {
          return {
            ok: false,
            error:
              "This portal is invite-only. Check the email and password, or contact your assignor for access.",
          };
        }
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(matched));
        setUser(matched);
        return { ok: true };
      },
      logout() {
        sessionStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [mode, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

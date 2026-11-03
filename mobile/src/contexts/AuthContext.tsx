import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import * as authApi from "../api/auth";
import { tokenStorage, activeRestaurantStorage } from "../api/storage";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStorage.get();
        if (!token) return;
        const me = await authApi.getConnectedUser();
        setUser(me);
      } catch {
        await tokenStorage.clear();
        await activeRestaurantStorage.clear();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser, accessToken } = await authApi.login(email, password);
    await tokenStorage.set(accessToken);
    setUser(loggedInUser);
  }, []);

  const signOut = useCallback(async () => {
    await tokenStorage.clear();
    await activeRestaurantStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, isLoading, signIn, signOut }), [user, isLoading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

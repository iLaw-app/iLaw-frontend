import { createContext, useContext, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

async function storeGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}
async function storeSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
  return SecureStore.setItemAsync(key, value);
}
async function storeDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
  return SecureStore.deleteItemAsync(key);
}

export type UserRole = 'user' | 'lawyer';

export interface UserInfo {
  id: string;
  email: string | null;
  nickname: string | null;
  region: string | null;
  birthDate: string | null;
  gender: string | null;
  provider: string;
  profileCompleted: boolean;
  role: UserRole;
  affiliation?: string;
}

interface AuthState {
  role: UserRole;
  roleOverride: UserRole | null;
  setRoleOverride: (r: UserRole | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
  setAuthTokens: (tokens: AuthTokens) => Promise<void>;
  clearAuth: () => Promise<void>;
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TOKEN_KEY = 'ilaw.accessToken';
const REFRESH_TOKEN_KEY = 'ilaw.refreshToken';

export async function getStoredTokens(): Promise<Partial<AuthTokens>> {
  const [accessToken, refreshToken] = await Promise.all([
    storeGet(ACCESS_TOKEN_KEY),
    storeGet(REFRESH_TOKEN_KEY),
  ]);
  return {
    accessToken: accessToken ?? undefined,
    refreshToken: refreshToken ?? undefined,
  };
}

async function saveStoredTokens(tokens: AuthTokens) {
  await Promise.all([
    storeSet(ACCESS_TOKEN_KEY, tokens.accessToken),
    storeSet(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

async function deleteStoredTokens() {
  await Promise.all([
    storeDelete(ACCESS_TOKEN_KEY),
    storeDelete(REFRESH_TOKEN_KEY),
  ]);
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [roleOverride, setRoleOverride] = useState<UserRole | null>(null);

  const role: UserRole = roleOverride ?? user?.role ?? 'user';

  const setAuthTokens = async (tokens: AuthTokens) => {
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    await saveStoredTokens(tokens);
  };

  const clearAuth = async () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setRoleOverride(null);
    await deleteStoredTokens();
  };

  return (
    <AuthContext.Provider value={{
      role,
      roleOverride,
      setRoleOverride,
      accessToken,
      setAccessToken,
      refreshToken,
      setRefreshToken,
      setAuthTokens,
      clearAuth,
      user,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default function _() { return null; }

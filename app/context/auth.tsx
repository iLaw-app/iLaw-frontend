import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'lawyer';

export interface UserInfo {
  id: string;
  email: string | null;
  nickname: string | null;
  region: string | null;
  birthYear: number | null;
  gender: string | null;
  provider: string;
  profileCompleted: boolean;
}

interface AuthState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('user');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  return (
    <AuthContext.Provider value={{ role, setRole, accessToken, setAccessToken, user, setUser }}>
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

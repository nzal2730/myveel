import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, TOKEN_KEY } from '../lib/api';
import type { AuthResponse, User } from '../types';

interface RegisterPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

interface RegisterResult {
  token?: string;
  user: User;
  devOtps?: { emailOtp?: string; smsOtp?: string };
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      return null;
    }
    const me = await api.get<User>('/auth/me');
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    refreshUser()
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, refreshUser, logout]);

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('myveel:unauthorized', onUnauthorized);
    return () => window.removeEventListener('myveel:unauthorized', onUnauthorized);
  }, [logout]);

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await api.post<AuthResponse>('/auth/login', { identifier, password });
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    return result;
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await api.post<RegisterResult>('/auth/register', payload);
      if (result.token) {
        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
        setUser(result.user);
      }
      return result;
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, login, register, logout, refreshUser, setUser }),
    [token, user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

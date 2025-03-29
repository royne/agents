import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { USERS } from '../data/users';
import { supabase } from '../lib/supabase';

type AppContextType = {
  apiKey: string | null;
  authData: { isAuthenticated: boolean } | null;
  setApiKey: (key: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [authData, setAuthData] = useState<{ isAuthenticated: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth_data');
    if (storedAuth) {
      setAuthData(JSON.parse(storedAuth));
    }
  }, [router]);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('groq_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      return false;
    }

    if (data?.user) {
      localStorage.setItem('auth_data', JSON.stringify(data.user));
      setAuthData({ isAuthenticated: true });
      return true;
    }
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_data');
    setAuthData(null);
    router.push('/auth/login');
  };

  return (
    <AppContext.Provider value={{ apiKey, authData, setApiKey, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
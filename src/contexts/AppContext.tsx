import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { USERS } from '../data/users';

type AppContextType = {
  apiKey: string | null;
  authData: { isAuthenticated: boolean } | null;
  setApiKey: (key: string) => void;
  login: (username: string, password: string) => boolean;
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

  const login = (username: string, password: string): boolean => {
    const user = USERS[username];
    if (user?.password === password) {
      const auth = { 
        isAuthenticated: true,
        username: user.username,
        role: user.role 
      };
      localStorage.setItem('auth_data', JSON.stringify(auth));
      setAuthData(auth);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth_data');
    setAuthData(null);
  };

  return (
    <AppContext.Provider value={{ apiKey, authData, setApiKey, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
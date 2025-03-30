import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { USERS } from '../data/users';
import { supabase } from '../lib/supabase';

type AppContextType = {
  apiKey: string | null;
  authData: { 
    isAuthenticated: boolean;
    company_id?: string;
  } | null;
  setApiKey: (key: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [authData, setAuthData] = useState<{ 
    isAuthenticated: boolean;
    company_id?: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', session.user.id)
          .single();

        const authData = {
          isAuthenticated: true,
          company_id: profile?.company_id
        };
        
        localStorage.setItem('auth_data', JSON.stringify(authData));
        setAuthData(authData);
      }
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('groq_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', data.user.id)
        .single();

      const authData = {
        isAuthenticated: true,
        company_id: profile?.company_id
      };
      
      localStorage.setItem('auth_data', JSON.stringify(authData));
      setAuthData(authData);
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
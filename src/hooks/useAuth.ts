import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'auth_data';

interface AuthData {
  username: string;
  role: string;
  isAuthenticated: boolean;
  company_id?: string;
  user_id?: string;
}

export const useAuth = () => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión activa en Supabase
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Si hay sesión en Supabase, obtener datos del perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          const newAuthData = {
            username: profile.full_name || session.user.email || '',
            role: profile.role || 'user',
            isAuthenticated: true,
            company_id: profile.company_id,
            user_id: session.user.id
          };
          
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthData));
          setAuthData(newAuthData);
          setIsLoginModalOpen(false);
        } else {
          // Sesión existe pero no hay perfil
          setIsLoginModalOpen(true);
        }
      } else {
        // Verificar si hay datos en localStorage como respaldo
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          try {
            setAuthData(JSON.parse(storedAuth));
          } catch (error) {
            console.error('Error parsing auth data:', error);
            setIsLoginModalOpen(true);
          }
        } else {
          setIsLoginModalOpen(true);
        }
      }
    };
    
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Obtener datos del perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profile) {
          const newAuthData = {
            username: profile.full_name || data.user.email || '',
            role: profile.role || 'user',
            isAuthenticated: true,
            company_id: profile.company_id,
            user_id: data.user.id
          };
          
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthData));
          setAuthData(newAuthData);
          setIsLoginModalOpen(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = async () => {
    // Cerrar sesión en Supabase
    await supabase.auth.signOut();
    
    // Limpiar datos locales
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthData(null);
    setIsLoginModalOpen(true);
  };

  return {
    authData,
    isLoginModalOpen,
    login,
    logout
  };
};

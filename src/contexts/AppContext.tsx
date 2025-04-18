import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

type ThemeConfig = {
  primaryColor: string;
  useDarkMode: boolean;
};

type AppContextType = {
  apiKey: string | null;
  authData: { 
    isAuthenticated: boolean;
    company_id?: string;
    role?: string;
  } | null;
  themeConfig: ThemeConfig;
  setApiKey: (key: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  updateTheme: (config: Partial<ThemeConfig>) => void;
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [authData, setAuthData] = useState<{ 
    isAuthenticated: boolean;
    company_id?: string;
    role?: string;
  } | null>(null);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: '#3B82F6', // Color azul predeterminado
    useDarkMode: true
  });
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id, role')
          .eq('user_id', session.user.id)
          .single();

        const authData = {
          isAuthenticated: true,
          company_id: profile?.company_id,
          role: profile?.role
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
    
    // Cargar la configuración del tema desde localStorage
    const storedTheme = localStorage.getItem('theme_config');
    if (storedTheme) {
      try {
        const parsedTheme = JSON.parse(storedTheme);
        setThemeConfig(parsedTheme);
        
        // Aplicar el tema inmediatamente
        document.documentElement.style.setProperty('--primary-color', parsedTheme.primaryColor);
        document.documentElement.classList.toggle('dark-theme', parsedTheme.useDarkMode);
        document.documentElement.classList.toggle('custom-theme', !parsedTheme.useDarkMode);
        
        // Aplicar clases adicionales si está en modo claro
        if (!parsedTheme.useDarkMode) {
          setTimeout(() => {
            const elements = document.querySelectorAll('.bg-gray-800, .bg-gray-700, .bg-gray-900, .text-white, .text-gray-300, .text-gray-400');
            elements.forEach(el => {
              // Cambiar a tema claro
              if (el.classList.contains('bg-gray-800') || el.classList.contains('bg-gray-900')) {
                el.classList.add('bg-theme-component');
              }
              if (el.classList.contains('bg-gray-700')) {
                el.classList.add('bg-theme-component-hover');
              }
              if (el.classList.contains('text-white')) {
                el.classList.add('text-theme-primary');
              }
              if (el.classList.contains('text-gray-300') || el.classList.contains('text-gray-400')) {
                el.classList.add('text-theme-secondary');
              }
            });
          }, 300);
        }
      } catch (e) {
        console.error('Error al cargar la configuración del tema:', e);
      }
    } else {
      // Si no hay tema guardado, aplicar el tema predeterminado
      document.documentElement.style.setProperty('--primary-color', themeConfig.primaryColor);
      document.documentElement.classList.toggle('dark-theme', themeConfig.useDarkMode);
      document.documentElement.classList.toggle('custom-theme', !themeConfig.useDarkMode);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, role')
        .eq('user_id', data.user.id)
        .single();

      const authData = {
        isAuthenticated: true,
        company_id: profile?.company_id,
        role: profile?.role
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

  // Función para verificar si el usuario es administrador
  const isAdmin = (): boolean => {
    return authData?.role === 'admin';
  };
  
  // Función para actualizar la configuración del tema
  const updateTheme = (config: Partial<ThemeConfig>) => {
    const newConfig = { ...themeConfig, ...config };
    setThemeConfig(newConfig);
    localStorage.setItem('theme_config', JSON.stringify(newConfig));
    
    // Aplicar los cambios de tema al documento
    document.documentElement.style.setProperty('--primary-color', newConfig.primaryColor);
    
    // Aplicar clases de tema
    if (newConfig.useDarkMode !== themeConfig.useDarkMode) {
      // Cambio de modo oscuro/claro
      document.documentElement.classList.toggle('dark-theme', newConfig.useDarkMode);
      document.documentElement.classList.toggle('custom-theme', !newConfig.useDarkMode);
      
      // Forzar actualización de componentes
      setTimeout(() => {
        const elements = document.querySelectorAll('.bg-gray-800, .bg-gray-700, .bg-gray-900, .text-white, .text-gray-300, .text-gray-400');
        elements.forEach(el => {
          if (newConfig.useDarkMode) {
            // Volver al tema oscuro
            el.classList.remove('bg-theme-component', 'bg-theme-component-hover', 'text-theme-primary', 'text-theme-secondary', 'text-theme-tertiary');
          } else {
            // Cambiar a tema claro
            if (el.classList.contains('bg-gray-800') || el.classList.contains('bg-gray-900')) {
              el.classList.add('bg-theme-component');
            }
            if (el.classList.contains('bg-gray-700')) {
              el.classList.add('bg-theme-component-hover');
            }
            if (el.classList.contains('text-white')) {
              el.classList.add('text-theme-primary');
            }
            if (el.classList.contains('text-gray-300') || el.classList.contains('text-gray-400')) {
              el.classList.add('text-theme-secondary');
            }
          }
        });
        
        // Actualizar iconos activos
        document.querySelectorAll('.active-item').forEach(el => {
          (el as HTMLElement).style.color = newConfig.primaryColor;
        });
        
        // Actualizar botones primarios
        document.querySelectorAll('.btn-primary').forEach(el => {
          (el as HTMLElement).style.backgroundColor = newConfig.primaryColor;
        });
      }, 100);
    } else {
      // Solo cambio de color primario
      document.documentElement.classList.toggle('dark-theme', newConfig.useDarkMode);
      document.documentElement.classList.toggle('custom-theme', !newConfig.useDarkMode);
      
      // Actualizar iconos activos
      document.querySelectorAll('.active-item').forEach(el => {
        (el as HTMLElement).style.color = newConfig.primaryColor;
      });
      
      // Actualizar botones primarios
      document.querySelectorAll('.btn-primary').forEach(el => {
        (el as HTMLElement).style.backgroundColor = newConfig.primaryColor;
      });
    }
  };

  return (
    <AppContext.Provider value={{ 
      apiKey, 
      authData, 
      themeConfig,
      setApiKey, 
      login, 
      logout, 
      isAdmin,
      updateTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
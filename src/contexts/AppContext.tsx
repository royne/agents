import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { Plan, ModuleKey, isPlanAtLeast, computeModulesForPlan } from '../constants/plans';
import { FeatureKey, hasFeatureForPlan } from '../constants/features';

type ThemeConfig = {
  primaryColor: string;
  useDarkMode: boolean;
};

type AppContextType = {
  apiKey: string | null;
  openaiApiKey: string | null;
  googleAiKey: string | null;
  authData: {
    isAuthenticated: boolean;
    company_id?: string;
    role?: string;
    name?: string;
    plan?: Plan;
    modulesOverride?: Partial<Record<ModuleKey, boolean>>;
  } | null;
  themeConfig: ThemeConfig;
  setApiKey: (key: string | null) => void;
  setOpenaiApiKey: (key: string | null) => void;
  setGoogleAiKey: (key: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  hasPlan: (required: Plan) => boolean;
  canAccessModule: (module: ModuleKey) => boolean;
  hasFeature: (feature: FeatureKey) => boolean;
  updateTheme: (config: Partial<ThemeConfig>) => void;
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [openaiApiKey, setOpenaiApiKey] = useState<string | null>(null);
  const [googleAiKey, setGoogleAiKey] = useState<string | null>(null);
  const [authData, setAuthData] = useState<{
    isAuthenticated: boolean;
    company_id?: string;
    role?: string;
    name?: string;
    plan?: Plan;
    modulesOverride?: Partial<Record<ModuleKey, boolean>>;
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
          .select('company_id, role, name, plan, modules_override, groq_api_key, openai_api_key, google_api_key')
          .eq('user_id', session.user.id)
          .single();

        const authData = {
          isAuthenticated: true,
          company_id: profile?.company_id,
          role: profile?.role,
          name: profile?.name,
          plan: (profile as any)?.plan as Plan | undefined,
          modulesOverride: (profile as any)?.modules_override || undefined,
        };

        localStorage.setItem('auth_data', JSON.stringify(authData));
        setAuthData(authData);
        // Cargar API keys del perfil en el contexto
        setApiKey((profile as any)?.groq_api_key || null);
        setOpenaiApiKey((profile as any)?.openai_api_key || null);
        setGoogleAiKey((profile as any)?.google_api_key || null);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    // Cargar la configuración del tema desde localStorage (NO cargar API keys desde localStorage)
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
        .select('company_id, role, name, plan, modules_override, groq_api_key, openai_api_key, google_api_key')
        .eq('user_id', data.user.id)
        .single();

      const authData = {
        isAuthenticated: true,
        company_id: profile?.company_id,
        role: profile?.role,
        name: profile?.name,
        plan: (profile as any)?.plan as Plan | undefined,
        modulesOverride: (profile as any)?.modules_override || undefined,
      };

      localStorage.setItem('auth_data', JSON.stringify(authData));
      setAuthData(authData);
      // Cargar API keys del perfil en el contexto
      setApiKey((profile as any)?.groq_api_key || null);
      setOpenaiApiKey((profile as any)?.openai_api_key || null);
      setGoogleAiKey((profile as any)?.google_api_key || null);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_data');
    setAuthData(null);
    // Limpiar API keys en memoria al cerrar sesión
    setApiKey(null);
    setOpenaiApiKey(null);
    setGoogleAiKey(null);
    router.push('/auth/login');
  };

  // Función para verificar si el usuario es administrador
  const isAdmin = (): boolean => {
    return authData?.role === 'admin' || authData?.role === 'superadmin';
  };

  // Función para verificar si el usuario es superadministrador
  const isSuperAdmin = (): boolean => {
    return authData?.role === 'superadmin';
  };

  // Plan helpers
  const hasPlan = (required: Plan): boolean => {
    return isPlanAtLeast((authData?.plan as Plan) || 'basic', required);
  };

  const canAccessModule = (module: ModuleKey): boolean => {
    // Módulo de administración sigue regido por rol
    if (module === 'admin') return isAdmin();
    const plan = ((authData?.plan as Plan) || 'basic');
    const overrides = authData?.modulesOverride;
    const enabled = computeModulesForPlan(plan, overrides);
    return enabled.has(module);
  };

  const hasFeature = (feature: FeatureKey): boolean => {
    const plan = ((authData?.plan as Plan) || 'basic');
    // Por ahora no tenemos overrides de features en DB; solo por plan
    return hasFeatureForPlan(plan, feature);
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
      openaiApiKey,
      googleAiKey,
      authData,
      themeConfig,
      setApiKey,
      setOpenaiApiKey,
      setGoogleAiKey,
      login,
      logout,
      isAdmin,
      isSuperAdmin,
      hasPlan,
      canAccessModule,
      hasFeature,
      updateTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
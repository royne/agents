import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { Plan, ModuleKey, isPlanAtLeast } from '../constants/plans';
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
    userId?: string;
    company_id?: string;
    role?: string;
    name?: string;
    plan?: Plan;
    modulesOverride?: Partial<Record<ModuleKey, boolean>>;
    activeModules?: ModuleKey[];
    credits?: number;
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
  register: (email: string, password: string, phone: string, name: string) => Promise<{ success: boolean; error?: string }>;
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<{
    isAuthenticated: boolean;
    userId?: string;
    company_id?: string;
    role?: string;
    name?: string;
    plan?: Plan;
    modulesOverride?: Partial<Record<ModuleKey, boolean>>;
    activeModules?: ModuleKey[];
    credits?: number;
  } | null>(null);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: '#3B82F6', // Color azul predeterminado
    useDarkMode: true
  });
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 [DEBUG] checkSession: Iniciando...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔍 [DEBUG] checkSession: getSession result', { sessionExists: !!session, error: sessionError });

        if (sessionError) throw sessionError;

        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('company_id, role, name, plan, modules_override')
            .eq('user_id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }

          let activeModules: ModuleKey[] = [];

          const { data: creditsData } = await supabase
            .from('user_credits')
            .select('plan_key, balance')
            .eq('user_id', session.user.id)
            .single();

          console.log('🔍 [DEBUG] Credits data:', creditsData);

          const planKey = (creditsData?.plan_key || 'free') as Plan;

          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('features')
            .eq('key', planKey)
            .single();

          if (planData?.features?.active_modules) {
            activeModules = planData.features.active_modules;
          }

          const newAuthData = {
            isAuthenticated: true,
            userId: session.user.id,
            company_id: profile?.company_id,
            role: profile?.role,
            name: profile?.name,
            plan: planKey,
            credits: creditsData?.balance || 0,
            modulesOverride: (profile as any)?.modules_override || undefined,
            activeModules: activeModules,
          };

          localStorage.setItem('auth_data', JSON.stringify(newAuthData));
          setAuthData(newAuthData);
        } else {
          localStorage.removeItem('auth_data');
          setAuthData({ isAuthenticated: false });
        }
      } catch (error) {
        console.error('Check session error:', error);
        // En caso de error crítico, al menos desbloqueamos la UI
        setAuthData({ isAuthenticated: false });
      }
    };

    // Listener para cambios de autenticación - FUENTE DE VERDAD ÚNICA
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 [DEBUG] onAuthStateChange:', event, !!session);

      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        console.log('🔍 [DEBUG] Auth Event: Limpiando sesión');
        localStorage.removeItem('auth_data');
        setAuthData({ isAuthenticated: false });

        // Solo redirigir si no estamos ya en una ruta pública permitida
        if (event === 'SIGNED_OUT' && !router.pathname.startsWith('/auth') && router.pathname !== '/') {
          router.push('/');
        }
      } else if (session) {
        console.log('🔍 [DEBUG] Auth Event: Sesión activa, verificando perfil...');
        await checkSession();
      } else {
        console.log('🔍 [DEBUG] Auth Event: Ninguno de los anteriores, desbloqueando con defaults');
        setAuthData(prev => prev || { isAuthenticated: false });
      }
    });

    // Verificación inicial forzada como respaldo
    const timeoutId = setTimeout(() => {
      if (authData === null) {
        console.warn('⚠️ Backup session check triggered');
        checkSession();
      }
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme_config');
    if (storedTheme) {
      try {
        const parsedTheme = JSON.parse(storedTheme);
        setThemeConfig(parsedTheme);

        document.documentElement.style.setProperty('--primary-color', parsedTheme.primaryColor);
        document.documentElement.classList.toggle('dark-theme', parsedTheme.useDarkMode);
        document.documentElement.classList.toggle('custom-theme', !parsedTheme.useDarkMode);

        if (!parsedTheme.useDarkMode) {
          setTimeout(() => {
            const elements = document.querySelectorAll('.bg-gray-800, .bg-gray-700, .bg-gray-900, .text-white, .text-gray-300, .text-gray-400');
            elements.forEach(el => {
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
        .select('company_id, role, name, plan, modules_override')
        .eq('user_id', data.user.id)
        .single();

      let activeModules: ModuleKey[] = [];

      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('plan_key, balance')
        .eq('user_id', data.user.id)
        .single();

      const planKey = (creditsData?.plan_key || 'free') as Plan;

      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('features')
        .eq('key', planKey)
        .single();

      if (planData?.features?.active_modules) {
        activeModules = planData.features.active_modules;
      }

      const authData = {
        isAuthenticated: true,
        userId: data.user.id,
        company_id: profile?.company_id,
        role: profile?.role,
        name: profile?.name,
        plan: planKey,
        credits: creditsData?.balance || 0,
        modulesOverride: (profile as any)?.modules_override || undefined,
        activeModules: activeModules,
      };

      localStorage.setItem('auth_data', JSON.stringify(authData));
      setAuthData(authData);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, phone: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone,
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // El perfil y los créditos se crean automáticamente vía Trigger SQL
      // gracias a los metadatos pasados en el signUp.
      return { success: true };
    }

    return { success: false, error: 'Error desconocido durante el registro' };
  };

  const logout = async () => {
    try {
      // Limpiar localmente primero para feedback instantáneo
      localStorage.removeItem('auth_data');
      setAuthData({ isAuthenticated: false });

      // SignOut global en Supabase
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Error during signOut:', error);

      // onAuthStateChange se encargará de la redirección final
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const isAdmin = (): boolean => {
    return authData?.role === 'admin' || authData?.role === 'superadmin';
  };

  const isSuperAdmin = (): boolean => {
    return authData?.role === 'superadmin';
  };

  const hasPlan = (required: Plan): boolean => {
    return isPlanAtLeast((authData?.plan as Plan) || 'free', required);
  };

  const canAccessModule = (module: ModuleKey): boolean => {
    if (module === 'admin') return isAdmin();
    const overrides = authData?.modulesOverride;
    if (overrides && module in overrides) {
      return !!overrides[module];
    }
    if (authData?.activeModules) {
      return authData.activeModules.includes(module);
    }
    return false;
  };

  const hasFeature = (feature: FeatureKey): boolean => {
    const plan = ((authData?.plan as Plan) || 'free');
    return hasFeatureForPlan(plan, feature);
  };

  const updateTheme = (config: Partial<ThemeConfig>) => {
    const newConfig = { ...themeConfig, ...config };
    setThemeConfig(newConfig);
    localStorage.setItem('theme_config', JSON.stringify(newConfig));

    document.documentElement.style.setProperty('--primary-color', newConfig.primaryColor);

    if (newConfig.useDarkMode !== themeConfig.useDarkMode) {
      document.documentElement.classList.toggle('dark-theme', newConfig.useDarkMode);
      document.documentElement.classList.toggle('custom-theme', !newConfig.useDarkMode);

      setTimeout(() => {
        const elements = document.querySelectorAll('.bg-gray-800, .bg-gray-700, .bg-gray-900, .text-white, .text-gray-300, .text-gray-400');
        elements.forEach(el => {
          if (newConfig.useDarkMode) {
            el.classList.remove('bg-theme-component', 'bg-theme-component-hover', 'text-theme-primary', 'text-theme-secondary', 'text-theme-tertiary');
          } else {
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

        document.querySelectorAll('.active-item').forEach(el => {
          (el as HTMLElement).style.color = newConfig.primaryColor;
        });

        document.querySelectorAll('.btn-primary').forEach(el => {
          (el as HTMLElement).style.backgroundColor = newConfig.primaryColor;
        });
      }, 100);
    } else {
      document.documentElement.classList.toggle('dark-theme', newConfig.useDarkMode);
      document.documentElement.classList.toggle('custom-theme', !newConfig.useDarkMode);

      document.querySelectorAll('.active-item').forEach(el => {
        (el as HTMLElement).style.color = newConfig.primaryColor;
      });

      document.querySelectorAll('.btn-primary').forEach(el => {
        (el as HTMLElement).style.backgroundColor = newConfig.primaryColor;
      });
    }
  };

  return (
    <AppContext.Provider value={{
      apiKey: 'CONFIGURED',
      openaiApiKey: 'CONFIGURED',
      googleAiKey: 'CONFIGURED',
      authData,
      themeConfig,
      setApiKey: () => { },
      setOpenaiApiKey: () => { },
      setGoogleAiKey: () => { },
      login,
      logout,
      isAdmin,
      isSuperAdmin,
      hasPlan,
      canAccessModule,
      hasFeature,
      updateTheme,
      register
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
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
    email?: string;
    company_id?: string;
    role?: string;
    name?: string;
    plan?: Plan;
    modulesOverride?: Partial<Record<ModuleKey, boolean>>;
    activeModules?: ModuleKey[];
    credits?: number;
    expiresAt?: string;
    is_mentor?: boolean;
    community_name?: string;
    phone?: string;
    avatar_url?: string;
    is_setup_completed?: boolean;
    country?: string;
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
  register: (email: string, password: string, phone: string, name: string, country: string, referralCode?: string) => Promise<{ success: boolean; error?: string }>;
  isSyncing: boolean;
  syncUserData: () => Promise<void>;
};

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authData, setAuthData] = useState<AppContextType['authData']>(() => {
    // Inicialización híbrida: Intentar cargar desde localStorage inmediatamente
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auth_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch (e) {
          console.error('Error parsing cached auth data', e);
        }
      }
    }
    return null;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    primaryColor: '#3B82F6', // Color azul predeterminado
    useDarkMode: true
  });
  const router = useRouter();

  const checkSession = async (providedSession?: any) => {
    setIsSyncing(true);
    try {
      let session = providedSession;
      if (!session) {
        const { data: { session: s }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        session = s;
      }

      if (session) {
        try {
          const dbTimeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms));

          // Consultas con timeout para evitar bloqueos
          const [profileRes, creditsRes] = await Promise.race([
            Promise.all([
              supabase.from('profiles').select('company_id, role, name, plan, modules_override, is_mentor, country, phone, avatar_url, is_setup_completed').eq('user_id', session.user.id).single(),
              supabase.from('user_credits').select('plan_key, balance, expires_at').eq('user_id', session.user.id).single()
            ]),
            dbTimeout(5000) as Promise<[any, any]>
          ]);

          const profile = profileRes.data;
          const creditsData = creditsRes.data;
          const planKey = (creditsData?.plan_key || profile?.plan || 'free') as Plan;

          const planRes = await Promise.race([
            supabase.from('subscription_plans').select('features').eq('key', planKey).single(),
            dbTimeout(4000) as Promise<any>
          ]);

          const planData = planRes.data;
          if (planRes.error) console.warn('Error plan features:', planRes.error);

          let activeModules: ModuleKey[] = [];
          if (planData?.features?.active_modules) {
            activeModules = planData.features.active_modules;
          }

          // C) Obtener nombre de comunidad (si es alumno o mentor)
          let communityName = '';
          if (profile?.is_mentor) {
            const { data: mentorConf } = await supabase
              .from('referral_configs')
              .select('referral_code')
              .eq('user_id', session.user.id)
              .single();
            if (mentorConf) communityName = mentorConf.referral_code;
          } else {
            const { data: refData } = await supabase
              .from('referrals')
              .select('mentor_id')
              .eq('referred_id', session.user.id)
              .single();

            if (refData) {
              const { data: mentorConf } = await supabase
                .from('referral_configs')
                .select('referral_code')
                .eq('user_id', refData.mentor_id)
                .single();
              if (mentorConf) communityName = mentorConf.referral_code;
            }
          }

          const newAuthData = {
            isAuthenticated: true,
            userId: session.user.id,
            email: session.user.email,
            company_id: profile?.company_id,
            role: profile?.role,
            name: profile?.name,
            plan: planKey,
            credits: creditsData?.balance || 0,
            expiresAt: creditsData?.expires_at,
            is_mentor: profile?.is_mentor,
            community_name: communityName,
            modulesOverride: (profile as any)?.modules_override || undefined,
            activeModules: activeModules,
            country: profile?.country,
            phone: profile?.phone,
            avatar_url: profile?.avatar_url,
            is_setup_completed: profile?.is_setup_completed,
          };

          const currentSaved = localStorage.getItem('auth_data');
          if (currentSaved !== JSON.stringify(newAuthData)) {
            localStorage.setItem('auth_data', JSON.stringify(newAuthData));
            setAuthData(newAuthData);
          }
        } catch (innerError) {
          console.warn('Fallo temporal en DB, manteniendo sesión actual:', innerError);
          setAuthData(prev => prev || {
            isAuthenticated: true,
            userId: session.user.id,
            plan: 'free',
            credits: 0,
            is_mentor: false,
            activeModules: []
          });
        }
      } else {
        localStorage.removeItem('auth_data');
        setAuthData({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('FALLO CRÍTICO de sesión:', error);
      setAuthData({ isAuthenticated: false });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Verificación en cada navegación (Simplicidad y consistencia)
    if (authData?.isAuthenticated) {
      checkSession();
    }
  }, [router.pathname]);

  useEffect(() => {
    // Listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        localStorage.removeItem('auth_data');
        setAuthData({ isAuthenticated: false });
        if (event === 'SIGNED_OUT' && !router.pathname.startsWith('/auth') && router.pathname !== '/') {
          router.push('/');
        }
      } else if (session) {
        await checkSession(session);
      } else {
        setAuthData(prev => prev || { isAuthenticated: false });
      }
    });

    const backupTimeout = setTimeout(() => {
      if (authData === null) checkSession();
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(backupTimeout);
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
        .select('company_id, role, name, plan, modules_override, country, phone, avatar_url, is_setup_completed')
        .eq('user_id', data.user.id)
        .single();

      let activeModules: ModuleKey[] = [];

      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('plan_key, balance, expires_at')
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
        email: data.user.email,
        company_id: profile?.company_id,
        role: profile?.role,
        name: profile?.name,
        plan: planKey,
        credits: creditsData?.balance || 0,
        expiresAt: creditsData?.expires_at,
        modulesOverride: (profile as any)?.modules_override || undefined,
        activeModules: activeModules,
        country: profile?.country,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        is_setup_completed: profile?.is_setup_completed,
      };

      localStorage.setItem('auth_data', JSON.stringify(authData));
      setAuthData(authData);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, phone: string, name: string, country: string, referralCode?: string): Promise<{ success: boolean; error?: string }> => {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: name,
          phone: phone,
          country: country,
          referral_code: referralCode || null,
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // El perfil y los créditos se crean automáticamente vía Trigger SQL
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
      register,
      isSyncing,
      syncUserData: checkSession,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
import { supabase } from '../../lib/supabase';
import { Plan, ModuleKey } from '../../constants/plans';

export interface Company {
  id?: string;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Profile {
  id: string;
  user_id: string;
  company_id: string;
  role: 'superadmin' | 'admin' | 'user';
  email?: string;
  name?: string;
  phone?: string;
  country?: string;
  plan?: Plan;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreateData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'superadmin' | 'admin' | 'user';
  company_id?: string;
  company_name?: string;
  plan?: Plan;
}

export interface UserWithProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  role: string;
  company_id: string;
  company_name?: string;
  plan?: Plan;
  modules_override?: Partial<Record<ModuleKey, boolean>>;
  created_at: string;
  credits?: {
    balance: number;
    plan_key: string;
    unlimited_credits: boolean;
    expires_at?: string;
    is_active?: boolean;
  };
}

export const adminService = {
  // Funciones para gestionar compañías
  async getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error al obtener compañías:', error);
      return [];
    }

    return data || [];
  },

  async updateUserModulesOverride(userId: string, overrides: Partial<Record<ModuleKey, boolean>> | null): Promise<boolean> {
    // Si overrides es null, limpiar el campo
    const updatePayload = overrides === null ? { modules_override: null } : { modules_override: overrides };
    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('user_id', userId);

    if (error) {
      console.error('Error al actualizar modules_override del usuario:', error);
      return false;
    }
    return true;
  },

  async updateUserPlan(userId: string, plan: Plan): Promise<boolean> {
    // 1. Actualizar tabla profiles (compatibilidad legado si aún se usa el campo, pero con el nuevo valor)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error al actualizar plan en perfil:', profileError);
    }

    // 2. Actualizar tabla user_credits (fuente de verdad)
    const { error: creditError } = await supabase
      .from('user_credits')
      .update({ plan_key: plan })
      .eq('user_id', userId);

    if (creditError) {
      console.error('Error al actualizar plan en créditos:', creditError);
      return false;
    }

    return true;
  },

  async createCompany(name: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error al crear compañía:', error);
      return null;
    }

    return data;
  },

  // --- GESTIÓN DE PLANES ---
  async getSubscriptionPlans(): Promise<any[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_usd', { ascending: true });
    
    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
    return data;
  },

  async updatePlanFeatures(planKey: string, features: any): Promise<boolean> {
    const { error } = await supabase
      .from('subscription_plans')
      .update({ features })
      .eq('key', planKey);
    
    if (error) {
      console.error('Error updating plan features:', error);
      return false;
    }
    return true;
  },

  async getCompanyById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener compañía:', error);
      return null;
    }

    return data;
  },

  // Funciones para gestionar usuarios y perfiles
  async getAllUsers(companyId?: string): Promise<UserWithProfile[]> {
    try {
      // 1. Obtener perfiles, filtrando por compañía si se proporciona un ID
      let query = supabase.from('profiles').select('*');
      
      // Si se proporciona un ID de compañía, filtrar por esa compañía
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data: profiles, error: profilesError } = await query;

      if (profilesError) {
        throw new Error(`Error al obtener perfiles: ${profilesError.message}`);
      }

      if (!profiles || profiles.length === 0) {
        return [];
      }

      // 2. Obtener compañías
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');

      if (companiesError) {
        throw new Error(`Error al obtener compañías: ${companiesError.message}`);
      }

      // 3. Obtener la sesión actual para obtener información del usuario
      const { data: { session } } = await supabase.auth.getSession();
      
      // 4. Obtener créditos de todos los usuarios
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('*');

      // 5. Transformar los datos al formato esperado
      const combinedUsers = profiles.map((profile: any) => {
        const company = companies?.find((c: any) => c.id === profile.company_id);
        const userCredits = creditsData?.find((c: any) => c.user_id === profile.user_id);
        
        return {
          id: profile.user_id,
          email: profile.email || 'Sin correo',
          name: profile.name || '',
          role: profile.role || 'user',
          company_id: profile.company_id || '',
          company_name: company?.name || 'Sin empresa',
          plan: (profile as any)?.plan || 'free',
          modules_override: (profile as any)?.modules_override || undefined,
          created_at: profile.created_at || new Date().toISOString(),
          credits: userCredits ? {
            balance: userCredits.balance,
            plan_key: userCredits.plan_key,
            unlimited_credits: userCredits.unlimited_credits,
            expires_at: userCredits.expires_at,
            is_active: userCredits.is_active
          } : undefined
        };
      });

      return combinedUsers;
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      return [];
    }
  },

  async createUser(userData: UserCreateData): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      // Obtener el token de autenticación actual
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      
      // Usar el endpoint de API para crear el usuario
      // Esto evita el problema de iniciar sesión automáticamente con el usuario recién creado
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Incluir token en el encabezado
        },
        body: JSON.stringify({
          ...userData,
          _authToken: token // Incluir token en el cuerpo como respaldo
        }),
        credentials: 'include', // Incluir cookies de sesión
      });

      const result = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          message: result.error || 'Error al crear usuario' 
        };
      }

      return {
        success: true,
        message: result.message || 'Usuario creado correctamente',
        userId: result.userId
      };
    } catch (err: any) {
      console.error('Error en el proceso de creación de usuario:', err);
      return { 
        success: false, 
        message: err.message || 'Error desconocido al crear usuario' 
      };
    }
  },

  async updateUserRole(userId: string, role: 'superadmin' | 'admin' | 'user'): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('user_id', userId);

    if (error) {
      console.error('Error al actualizar rol de usuario:', error);
      return false;
    }

    return true;
  },

  async updateUserCompany(userId: string, companyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ company_id: companyId })
      .eq('user_id', userId);

    if (error) {
      console.error('Error al actualizar compañía de usuario:', error);
      return false;
    }

    return true;
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // En lugar de eliminar el usuario de Auth (que requiere permisos de admin),
      // eliminamos el perfil asociado y marcamos el usuario como inactivo
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (profileError) {
        throw new Error(`Error al eliminar perfil: ${profileError.message}`);
      }
      
      return true;
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      return false;
    }
  },

  // Gestión de Créditos y Suscripciones
  async getAllUserCredits(): Promise<any[]> {
    // Refactorizamos para obtener todos los perfiles y unir sus créditos (Left Join)
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        email,
        name,
        phone,
        country,
        created_at,
        plan,
        user_credits (
          plan_key,
          balance,
          total_consumed,
          unlimited_credits,
          updated_at,
          expires_at,
          is_active
        ),
        referrals_referred:referrals!referrals_referred_id_fkey (
          status,
          mentor:profiles!referrals_mentor_id_fkey (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener créditos (via profiles):', error);
      return [];
    }

    // Aplanar la estructura para que sea compatible con la UI anterior
    const flattened = (data || []).map(p => {
      const credits = Array.isArray(p.user_credits) ? p.user_credits[0] : p.user_credits;
      return {
        user_id: p.user_id,
        profiles: {
          email: p.email,
          name: p.name,
          phone: p.phone,
          country: p.country,
          created_at: p.created_at
        },
        // Mapear campos de créditos o valores por defecto
        plan_key: credits?.plan_key || p.plan || 'free',
        balance: credits?.balance || 0,
        total_consumed: credits?.total_consumed || 0,
        unlimited_credits: credits?.unlimited_credits || false,
        updated_at: credits?.updated_at || p.created_at,
        expires_at: credits?.expires_at,
        is_active: credits ? credits.is_active : true,
        // Mentor info
        mentor_name: (p as any).referrals_referred ? (
          Array.isArray((p as any).referrals_referred) 
            ? (p as any).referrals_referred[0]?.mentor?.name 
            : (p as any).referrals_referred.mentor?.name
        ) : null
      };
    });

    return flattened;
  },

  async updateUserCredits(userId: string, updates: { balance?: number, plan_key?: string, unlimited_credits?: boolean, is_active?: boolean }): Promise<boolean> {
    const { error } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error al actualizar créditos:', error);
      return false;
    }
    return true;
  },

  async activateUserPlanManually(userId: string, planKey: Plan, amount?: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      const response = await fetch('/api/admin/activate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, planKey, amount })
      });

      const result = await response.json();
      if (!response.ok) {
        return { success: false, message: result.error || 'Error al activar plan' };
      }

      return { success: true, message: result.message };
    } catch (err: any) {
      console.error('Error enviando activación manual:', err);
      return { success: false, message: 'Fallo de conexión con el servidor' };
    }
  },

  // --- ANALÍTICA DE PAGOS (Fase 3) ---
  async getPaymentAnalytics(): Promise<{
    totalRevenue: number;
    revenueByPlan: Record<string, number>;
    recentPayments: any[];
    dailyRevenue: { date: string, amount: number }[];
    userStats: { total: number, active: number, free: number };
    generationStats: { total: number };
  }> {
    try {
      // 1. Ingresos Totales y por Plan
      const { data: totals, error: totalsError } = await supabase
        .from('payment_history')
        .select('plan_key, amount, created_at');

      if (totalsError) throw totalsError;

      const revenueByPlan: Record<string, number> = {};
      let totalRevenue = 0;
      const dailyMap: Record<string, number> = {};

      totals?.forEach(p => {
        const amount = Number(p.amount) || 0;
        totalRevenue += amount;
        revenueByPlan[p.plan_key] = (revenueByPlan[p.plan_key] || 0) + amount;

        const date = new Date(p.created_at).toISOString().split('T')[0];
        dailyMap[date] = (dailyMap[date] || 0) + amount;
      });

      // 2. Pagos Recientes (con info de perfil)
      const { data: recent, error: recentError } = await supabase
        .from('payment_history')
        .select(`
          *,
          profiles (name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      // 3. Estadísticas de Usuarios
      const { data: users, error: usersError } = await supabase
        .from('user_credits')
        .select('plan_key, is_active');
      
      if (usersError) throw usersError;

      const userStats = {
        total: users.length,
        active: users.filter(u => u.is_active && u.plan_key !== 'free').length,
        free: users.filter(u => !u.is_active || u.plan_key === 'free').length
      };

      // 4. Estadísticas de Generaciones
      const { count: genCount, error: genError } = await supabase
        .from('image_generations')
        .select('*', { count: 'exact', head: true });

      if (genError) throw genError;

      // 5. Formatear Daily Revenue
      const dailyRevenue = Object.entries(dailyMap)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalRevenue,
        revenueByPlan,
        recentPayments: recent || [],
        dailyRevenue,
        userStats,
        generationStats: { total: genCount || 0 }
      };
    } catch (err) {
      console.error('Error al obtener analíticas de pagos:', err);
      return {
        totalRevenue: 0,
        revenueByPlan: {},
        recentPayments: [],
        dailyRevenue: [],
        userStats: { total: 0, active: 0, free: 0 },
        generationStats: { total: 0 }
      };
    }
  }
};

import { supabase } from '../../lib/supabase';

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
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreateData {
  email: string;
  password: string;
  name: string;
  role: 'superadmin' | 'admin' | 'user';
  company_id?: string;
  company_name?: string;
}

export interface UserWithProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
  company_id: string;
  company_name?: string;
  created_at: string;
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
      
      // 4. Transformar los datos al formato esperado
      const combinedUsers = profiles.map(profile => {
        const company = companies?.find(c => c.id === profile.company_id);
        
        return {
          id: profile.user_id,
          email: profile.email || 'Sin correo',
          name: profile.name || '',
          role: profile.role || 'user',
          company_id: profile.company_id || '',
          company_name: company?.name || 'Sin empresa',
          created_at: profile.created_at || new Date().toISOString()
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
      // Usar el endpoint de API para crear el usuario
      // Esto evita el problema de iniciar sesión automáticamente con el usuario recién creado
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
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
      
      // Nota: En un entorno real, necesitarías una función serverless o un endpoint
      // de API para eliminar completamente el usuario de Auth
      
      return true;
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      return false;
    }
  }
};

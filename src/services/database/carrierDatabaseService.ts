import { supabase } from '../../lib/supabase';

// Interfaces para las transportadoras
export interface BaseCarrier {
  id?: string;
  name: string;
  city: string;
  state: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserCarrier extends BaseCarrier {
  company_id: string;
  base_id?: string;
}

/**
 * Servicio para gestionar las transportadoras en la base de datos
 */
class CarrierDatabaseService {
  private userId: string | null = null;
  private companyId: string | null = null;
  private isAdminUser: boolean = false;

  /**
   * Establece el usuario, la compañía y el estado de administrador para las operaciones de base de datos
   */
  setUserAndCompany(userId: string | null, companyId: string | null, isAdmin: boolean = false) {
    this.userId = userId;
    this.companyId = companyId;
    this.isAdminUser = isAdmin;
    return { data: true };
  }

  /**
   * Verifica si el usuario es administrador
   */
  private async isAdmin(): Promise<boolean> {
    return this.isAdminUser;
  }

  /**
   * Obtiene todas las transportadoras base (solo administradores)
   */
  async getAllBaseCarriers(): Promise<BaseCarrier[]> {
    try {
      if (!(await this.isAdmin())) {
        throw new Error('Solo los administradores pueden acceder a las transportadoras base');
      }

      const { data, error } = await supabase
        .from('base_carriers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error obteniendo transportadoras base:', error);
      return [];
    }
  }

  /**
   * Busca transportadoras base por ciudad o departamento (disponible para todos)
   */
  async searchBaseCarriers(searchType: 'city' | 'state', searchTerm: string): Promise<BaseCarrier[]> {
    try {
      const { data, error } = await supabase
        .from('base_carriers')
        .select('*')
        .ilike(searchType, `%${searchTerm}%`)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`Error buscando transportadoras base por ${searchType}:`, error);
      return [];
    }
  }

  /**
   * Obtiene todas las transportadoras del usuario actual
   */
  async getUserCarriers(): Promise<UserCarrier[]> {
    if (!this.companyId) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_carriers')
        .select('*')
        .eq('company_id', this.companyId)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error obteniendo transportadoras del usuario:', error);
      return [];
    }
  }

  /**
   * Busca transportadoras del usuario por ciudad o departamento
   */
  async searchUserCarriers(searchType: 'city' | 'state', searchTerm: string): Promise<UserCarrier[]> {
    if (!this.companyId) return [];
    
    try {
      const { data, error } = await supabase
        .from('user_carriers')
        .select('*')
        .eq('company_id', this.companyId)
        .ilike(searchType, `%${searchTerm}%`)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`Error buscando transportadoras del usuario por ${searchType}:`, error);
      return [];
    }
  }

  /**
   * Crea una nueva transportadora para el usuario actual
   */
  async createUserCarrier(carrier: Omit<UserCarrier, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<UserCarrier | null> {
    if (!this.companyId) return null;
    
    try {
      // Usamos el base_id proporcionado o lo dejamos undefined
      const newCarrier = {
        ...carrier,
        company_id: this.companyId
      };
      
      const { data, error } = await supabase
        .from('user_carriers')
        .insert([newCarrier])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creando transportadora:', error);
      return null;
    }
  }

  /**
   * Actualiza una transportadora del usuario
   */
  async updateUserCarrier(id: string, updates: Partial<UserCarrier>): Promise<UserCarrier | null> {
    if (!this.companyId) return null;
    
    try {
      // Primero verificamos si la transportadora existe y pertenece a la compañía
      const { data: existingData, error: existingError } = await supabase
        .from('user_carriers')
        .select('*')
        .eq('id', id)
        .eq('company_id', this.companyId)
        .maybeSingle();
      
      if (existingError) {
        console.error('Error verificando transportadora existente:', existingError);
        return null;
      }
      
      // Si no existe, creamos una nueva transportadora para esta compañía
      if (!existingData) {
        console.log('Transportadora no encontrada, creando una nueva');
        return this.createUserCarrier(updates as Omit<UserCarrier, 'id' | 'company_id' | 'created_at' | 'updated_at'>);
      }
      
      // Actualizamos la transportadora con los datos proporcionados
      // El base_id ya viene incluido en updates si es necesario
      const { data, error } = await supabase
        .from('user_carriers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error actualizando transportadora:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error actualizando transportadora:', error);
      return null;
    }
  }

  /**
   * Elimina una transportadora del usuario
   */
  async deleteUserCarrier(id: string): Promise<boolean> {
    if (!this.companyId) return false;
    
    try {
      const { error } = await supabase
        .from('user_carriers')
        .delete()
        .eq('id', id)
        .eq('company_id', this.companyId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error eliminando transportadora:', error);
      return false;
    }
  }

  /**
   * Importa transportadoras base desde un array (solo administradores)
   */
  async importBaseCarriers(carriers: Omit<BaseCarrier, 'id' | 'created_at' | 'updated_at'>[]): Promise<{ success: boolean; count: number }> {
    try {
      if (!(await this.isAdmin())) {
        throw new Error('Solo los administradores pueden importar transportadoras base');
      }

      const { data, error } = await supabase
        .from('base_carriers')
        .insert(carriers)
        .select();
      
      if (error) throw error;
      
      return { success: true, count: data?.length || 0 };
    } catch (error) {
      console.error('Error importando transportadoras base:', error);
      return { success: false, count: 0 };
    }
  }
}

export const carrierDatabaseService = new CarrierDatabaseService();

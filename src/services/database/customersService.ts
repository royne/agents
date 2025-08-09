import { supabase } from '../../lib/supabase';
import type { Customer } from '../../types/orders';

export const customersDatabaseService = {
  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at'>, company_id: string): Promise<Customer | null> {
    console.log('=== DEBUG: createCustomer ===');
    console.log('Datos del cliente:', customerData);
    console.log('Company ID:', company_id);
    
    try {
      // Supabase ignora automáticamente las propiedades que no existen en la tabla
      const { data, error } = await supabase
        .from('customers')
        .insert({ ...customerData, company_id })
        .select()
        .single();

      if (error) {
        console.error('Error al crear cliente en Supabase:');
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        console.error('Detalles:', error.details);
        return null;
      }
      
      console.log('Cliente creado exitosamente:', data?.id);
      return data;
    } catch (error) {
      console.error('Excepción al crear cliente:');
      console.error('Error completo:', error);
      return null;
    }
  },

  async getCustomers(company_id: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false });

    return error ? [] : data;
  },

  async getCustomerByPhone(phone: string, company_id: string): Promise<Customer | null> {
    console.log('=== DEBUG: getCustomerByPhone ===');
    console.log('Buscando teléfono:', phone);
    console.log('Company ID:', company_id);
    
    try {
      // Limpiamos el teléfono de caracteres especiales
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      console.log('Teléfono limpio para búsqueda:', cleanPhone);
      
      // Primero intentamos una búsqueda exacta con el teléfono limpio
      let query = supabase
        .from('customers')
        .select('*')
        .eq('company_id', company_id);
      
      // Usamos filter() que es más seguro que eq() para valores que pueden contener caracteres especiales
      const { data, error } = await query
        .filter('phone', 'eq', cleanPhone)
        .maybeSingle();

      if (error) {
        console.error('Error al buscar cliente por teléfono:');
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        console.error('Detalles:', error.details);
        return null;
      }
      
      if (data) {
        console.log('Cliente encontrado:', data.id);
        return data;
      }
      
      console.log('Cliente no encontrado con ese teléfono (normal)');
      return null;
    } catch (error) {
      console.error('Excepción al buscar cliente por teléfono:');
      console.error('Error completo:', error);
      return null;
    }
  },

  async updateCustomer(id: string, updates: Partial<Customer>, company_id: string): Promise<Customer | null> {
    console.log('=== DEBUG: updateCustomer ===');
    console.log('ID del cliente:', id);
    console.log('Datos de actualización:', updates);
    
    try {
      // Supabase ignora automáticamente las propiedades que no existen en la tabla
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, company_id })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar cliente en Supabase:');
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        console.error('Detalles:', error.details);
        return null;
      }
      
      console.log('Cliente actualizado exitosamente');
      return data;
    } catch (error) {
      console.error('Excepción al actualizar cliente:');
      console.error('Error completo:', error);
      return null;
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    return !error;
  },

  // Método para buscar o crear cliente por teléfono
  async findOrCreateCustomer(customerData: Omit<Customer, 'id' | 'created_at'>, company_id: string): Promise<Customer | null> {
    console.log('=== DEBUG: findOrCreateCustomer ===');
    console.log('Buscando cliente por teléfono:', customerData.phone);
    console.log('Company ID:', company_id);
    
    try {
      // Primero intentamos encontrar el cliente por teléfono
      const existingCustomer = await this.getCustomerByPhone(customerData.phone, company_id);
      
      if (existingCustomer) {
        console.log('Cliente encontrado, actualizando datos:', existingCustomer.id);
        // Si existe, actualizamos sus datos
        const updatedCustomer = await this.updateCustomer(existingCustomer.id, customerData, company_id);
        if (updatedCustomer) {
          console.log('Cliente actualizado correctamente');
          return updatedCustomer;
        } else {
          console.error('Error al actualizar cliente');
          return null;
        }
      } else {
        console.log('Cliente no encontrado, creando nuevo cliente');
        // Si no existe, lo creamos
        const newCustomer = await this.createCustomer(customerData, company_id);
        if (newCustomer) {
          console.log('Cliente creado correctamente:', newCustomer.id);
          return newCustomer;
        } else {
          console.error('Error al crear cliente');
          return null;
        }
      }
    } catch (error) {
      console.error('=== ERROR en findOrCreateCustomer ===');
      console.error('Tipo de error:', typeof error);
      console.error('Error completo:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace disponible');
      return null;
    }
  }
};

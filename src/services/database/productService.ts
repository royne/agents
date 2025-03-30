import { supabase } from '../../lib/supabase';
import type { Product } from '../../types/database';

export const productDatabaseService = {
  async createProduct(productData: Omit<Product, 'id' | 'created_at'>, company_id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...productData, company_id })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return null;
    }
    return data;
  },

  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting products:', error);
      return [];
    }
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return null;
    }
    return data;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    return true;
  }
};
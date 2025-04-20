import BaseExcelService from './BaseExcelService';

// Tipos para el análisis de productos
export interface ProductData {
  id?: string | number;
  nombre?: string;
  categoria?: string;
  cantidad?: number;
  precio?: number | string;
  costo?: number | string;
  margen?: number | string;
  [key: string]: any; // Para campos adicionales
}

// Mapeo de nombres de columnas del Excel a los campos normalizados para productos
export const productColumnMapping: Record<string, string> = {
  // Campos para productos
  'producto': 'nombre', 'product': 'nombre', 'nombre': 'nombre', 'name': 'nombre', 'item': 'nombre',
  'categoria': 'categoria', 'category': 'categoria', 'tipo': 'categoria', 'type': 'categoria',
  'cantidad': 'cantidad', 'quantity': 'cantidad', 'qty': 'cantidad', 'unidades': 'cantidad',
  'precio': 'precio', 'price': 'precio', 'valor_venta': 'precio',
  'costo': 'costo', 'cost': 'costo', 'precio_costo': 'costo',
  'margen': 'margen', 'margin': 'margen', 'utilidad': 'margen'
};

// Tipos para los resultados del análisis de productos
export interface ProductAnalysisResult {
  uniqueProductsCount: number;
  totalQuantity: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  averageMargin: number;
  categoryField: string | null;
  productsByCategory: Record<string, number>;
}

/**
 * Servicio especializado para el análisis de productos
 */
class ProductsAnalysisService extends BaseExcelService {
  /**
   * Normaliza los nombres de las columnas específicamente para datos de productos
   */
  public normalizeProductData(data: any[]): any[] {
    return this.normalizeColumnNames(data, productColumnMapping);
  }

  /**
   * Encuentra el campo de categoría en los datos
   */
  private findCategoryField(data: any[]): string | null {
    if (!data || data.length === 0) return null;
    
    // Buscar campos que puedan contener información de categoría
    const possibleCategoryFields = ['categoria', 'category', 'tipo', 'type'];
    
    // Verificar si alguno de estos campos existe en los datos
    const item = data[0];
    for (const field of possibleCategoryFields) {
      if (item[field] !== undefined) {
        return field;
      }
    }
    
    return null;
  }

  /**
   * Analiza los datos de productos
   */
  public analyzeProductsData(data: any[]): ProductAnalysisResult {
    if (!data || data.length === 0) {
      return {
        uniqueProductsCount: 0,
        totalQuantity: 0,
        totalValue: 0,
        totalCost: 0,
        totalProfit: 0,
        averageMargin: 0,
        categoryField: null,
        productsByCategory: {}
      };
    }
    
    // Normalizar nombres de columnas
    const normalizedData = this.normalizeProductData(data);
    
    let totalQuantity = 0;
    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let marginSum = 0;
    
    // Encontrar el campo de categoría
    const categoryField = this.findCategoryField(normalizedData);
    const productsByCategory: Record<string, number> = {};
    
    // Conjunto para contar productos únicos (por nombre)
    const uniqueProducts = new Set<string>();
    
    // Analizar cada producto
    normalizedData.forEach(product => {
      // Contar productos únicos
      if (product.nombre) {
        uniqueProducts.add(String(product.nombre));
      }
      
      // Sumar cantidad
      if (product.cantidad) {
        const quantity = this.extractNumber(product.cantidad);
        if (!isNaN(quantity)) {
          totalQuantity += quantity;
        }
      }
      
      // Sumar valor
      if (product.precio) {
        const price = this.extractNumber(product.precio);
        if (!isNaN(price)) {
          totalValue += price;
        }
      }
      
      // Sumar costo
      if (product.costo) {
        const cost = this.extractNumber(product.costo);
        if (!isNaN(cost)) {
          totalCost += cost;
        }
      }
      
      // Calcular margen
      if (product.precio && product.costo) {
        const price = this.extractNumber(product.precio);
        const cost = this.extractNumber(product.costo);
        
        if (!isNaN(price) && !isNaN(cost) && price > 0) {
          const margin = ((price - cost) / price) * 100;
          marginSum += margin;
        }
      } else if (product.margen) {
        const margin = this.extractNumber(product.margen);
        if (!isNaN(margin)) {
          marginSum += margin;
        }
      }
      
      // Agrupar por categoría
      if (categoryField && product[categoryField]) {
        const category = String(product[categoryField] || 'Sin categoría');
        productsByCategory[category] = (productsByCategory[category] || 0) + 1;
      }
    });
    
    // Calcular ganancia total
    totalProfit = totalValue - totalCost;
    
    // Calcular margen promedio
    const averageMargin = normalizedData.length > 0 ? marginSum / normalizedData.length : 0;
    
    // Ordenar las categorías por cantidad (descendente)
    const sortedProductsByCategory = Object.fromEntries(
      Object.entries(productsByCategory).sort(([, a], [, b]) => b - a)
    );
    
    const result: ProductAnalysisResult = {
      uniqueProductsCount: uniqueProducts.size,
      totalQuantity,
      totalValue,
      totalCost,
      totalProfit,
      averageMargin,
      categoryField,
      productsByCategory: sortedProductsByCategory
    };
    
    console.log('Resultado del análisis de productos:', result);
    return result;
  }
}

export default new ProductsAnalysisService();

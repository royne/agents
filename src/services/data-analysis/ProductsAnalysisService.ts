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
  // Campos para productos - Usando los nombres exactos proporcionados
  'PRODUCTO': 'nombre', 'PRODUCTO ID': 'id', 'producto': 'nombre', 'product': 'nombre', 'nombre': 'nombre', 'name': 'nombre', 'item': 'nombre',
  'VARIACION': 'variacion', 'variacion': 'variacion', 'variation': 'variacion', 'variant': 'variacion',
  'CANTIDAD': 'cantidad', 'cantidad': 'cantidad', 'quantity': 'cantidad', 'qty': 'cantidad',
  'TOTAL DE LA ORDEN': 'precio', 'precio': 'precio', 'price': 'precio', 'valor_venta': 'precio',
  'PRECIO PROVEEDOR': 'costo', 'costo': 'costo', 'cost': 'costo', 'precio_costo': 'costo',
  'GANANCIA': 'margen', 'ganancia': 'margen', 'margen': 'margen', 'margin': 'margen', 'utilidad': 'margen',
  'FECHA': 'fecha', 'fecha': 'fecha', 'date': 'fecha', 'created_at': 'fecha', 'fecha_venta': 'fecha'
};

// Tipos para las visualizaciones
export interface ProductProfitData {
  name: string;
  profit: number;
  quantity: number;
  totalValue: number;
}

export interface VariationData {
  name: string;
  value: number;
  profit: number;
}

export interface TrendData {
  date: string;
  profit: number;
  sales: number;
  products?: { name: string; quantity: number }[];
}

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
  productsByDepartment: Record<string, number>;
  productProfitData: ProductProfitData[];
  variationData: VariationData[];
  trendData: TrendData[];
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
    const possibleCategoryFields = [
      'categoria', 'category', 'tipo', 'type', 'departamento', 'department',
      'seccion', 'section', 'grupo', 'group', 'linea', 'line'
    ];
    
    // Verificar si alguno de estos campos existe en los datos
    const item = data[0];
    
    // Primero buscar coincidencias exactas
    for (const field of possibleCategoryFields) {
      if (item[field] !== undefined) {
        console.log(`Campo de categoría encontrado: ${field}`);
        return field;
      }
    }
    
    // Si no hay coincidencias exactas, buscar campos que contengan palabras clave
    const keywordsToFind = ['categ', 'depart', 'tipo', 'type', 'secc', 'group', 'line'];
    
    for (const key of Object.keys(item)) {
      const lowerKey = key.toLowerCase();
      if (keywordsToFind.some(keyword => lowerKey.includes(keyword))) {
        console.log(`Campo de categoría encontrado por palabra clave: ${key}`);
        return key;
      }
    }
    
    // Si no se encuentra ninguna categoría, crear una categoría artificial basada en el nombre
    if (item['nombre'] !== undefined) {
      console.log('Usando nombre de producto como categoría');
      return 'nombre';
    }
    
    return null;
  }
  
  /**
   * Encuentra el campo de departamento destino en los datos
   */
  private findDepartmentField(data: any[]): string | null {
    if (!data || data.length === 0) return null;
    
    const item = data[0];
    
    // Buscar específicamente el campo DEPARTAMENTO DESTINO
    if (item['DEPARTAMENTO DESTINO'] !== undefined) {
      console.log('Campo de departamento destino encontrado: DEPARTAMENTO DESTINO');
      return 'DEPARTAMENTO DESTINO';
    }
    
    // Buscar otras variantes posibles
    const possibleFields = [
      'departamento destino', 'Departamento Destino', 'departamento_destino',
      'DepartamentoDestino', 'DEPTO DESTINO', 'depto_destino', 'destino'
    ];
    
    for (const field of possibleFields) {
      if (item[field] !== undefined) {
        console.log(`Campo de departamento destino encontrado: ${field}`);
        return field;
      }
    }
    
    // Buscar campos que contengan 'destino' o 'departamento'
    for (const key of Object.keys(item)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('destino') || 
          (lowerKey.includes('depart') && lowerKey.includes('dest'))) {
        console.log(`Campo de departamento destino encontrado por palabra clave: ${key}`);
        return key;
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
        productsByCategory: {},
        productsByDepartment: {},
        productProfitData: [],
        variationData: [],
        trendData: []
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
    
    // Encontrar el campo de departamento destino
    const departmentField = this.findDepartmentField(normalizedData);
    const productsByDepartment: Record<string, number> = {};
    
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
      
      // Sumar ganancia directamente si está disponible
      if (product.margen) {
        const value = this.extractNumber(product.margen);
        if (!isNaN(value)) {
          // Asumimos que es la ganancia directa
          totalProfit += value;
          
          // Calcular margen si tenemos precio
          if (product.precio) {
            const price = this.extractNumber(product.precio);
            if (!isNaN(price) && price > 0) {
              const margin = (value / price) * 100;
              marginSum += margin;
            }
          }
        }
      }
      
      // Calcular margen si no está disponible directamente
      if (totalProfit === 0 && product.precio && product.costo) {
        const price = this.extractNumber(product.precio);
        const cost = this.extractNumber(product.costo);
        
        if (!isNaN(price) && !isNaN(cost) && price > 0) {
          const margin = ((price - cost) / price) * 100;
          marginSum += margin;
        }
      }
      
      // Agrupar por categoría
      if (categoryField && product[categoryField]) {
        let category = String(product[categoryField] || 'Sin categoría');
        
        // Si estamos usando el nombre como categoría, extraer la primera palabra
        if (categoryField === 'nombre') {
          // Limpiar el nombre (quitar números al inicio)
          category = category.replace(/^[\d\s\-_.:#]+\s*/g, '');
          // Tomar solo la primera palabra como categoría
          const firstWord = category.split(' ')[0];
          if (firstWord && firstWord.length > 3) { // Solo si la palabra tiene más de 3 caracteres
            category = firstWord;
          }
        }
        
        // Asegurarse de que la categoría no esté vacía
        if (category.trim() === '') {
          category = 'Sin categoría';
        }
        
        productsByCategory[category] = (productsByCategory[category] || 0) + 1;
      }
      
      // Agrupar por departamento destino
      if (departmentField && product[departmentField]) {
        let department = String(product[departmentField] || 'Sin departamento');
        
        // Limpiar y normalizar el nombre del departamento
        department = department.trim();
        
        // Convertir a título case (primera letra de cada palabra en mayúscula)
        department = department.toLowerCase().split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Asegurarse de que el departamento no esté vacío
        if (department === '') {
          department = 'Sin departamento';
        }
        
        productsByDepartment[department] = (productsByDepartment[department] || 0) + 1;
      }
    });
    
    // Calcular ganancia total solo si no se ha calculado directamente
    if (totalProfit === 0) {
      totalProfit = totalValue - totalCost;
    }
    
    // Calcular margen promedio
    // Si no tenemos margen calculado pero tenemos ganancia y valor, calculamos el margen global
    if (marginSum === 0 && totalProfit > 0 && totalValue > 0) {
      marginSum = (totalProfit / totalValue) * 100;
    }
    
    // Convertir a decimal para la interfaz (se multiplicará por 100 en la visualización)
    const averageMargin = normalizedData.length > 0 ? marginSum / normalizedData.length / 100 : 0;
    
    // Ordenar las categorías por cantidad (descendente)
    const sortedProductsByCategory = Object.fromEntries(
      Object.entries(productsByCategory).sort(([, a], [, b]) => b - a)
    );
    
    // Ordenar los departamentos por cantidad (descendente)
    const sortedProductsByDepartment = Object.fromEntries(
      Object.entries(productsByDepartment).sort(([, a], [, b]) => b - a)
    );
    
    // Procesar datos para las visualizaciones
    
    // 1. Datos de rentabilidad por producto
    const productMap = new Map<string, ProductProfitData>();
    normalizedData.forEach(product => {
      if (product.nombre) {
        const name = String(product.nombre);
        const profit = this.extractNumber(product.margen) || 0;
        const quantity = this.extractNumber(product.cantidad) || 0;
        const value = this.extractNumber(product.precio) || 0;
        
        if (!productMap.has(name)) {
          productMap.set(name, { name, profit: 0, quantity: 0, totalValue: 0 });
        }
        
        const productData = productMap.get(name)!;
        productData.profit += profit;
        productData.quantity += quantity;
        productData.totalValue += value;
      }
    });
    const productProfitData = Array.from(productMap.values());
    
    // 2. Datos de variaciones
    const variationMap = new Map<string, VariationData>();
    let hasVariationData = false;
    
    normalizedData.forEach(product => {
      if (product.variacion && String(product.variacion).trim() !== '') {
        hasVariationData = true;
        const name = String(product.variacion);
        const value = this.extractNumber(product.precio) || 0;
        const profit = this.extractNumber(product.margen) || 0;
        
        if (!variationMap.has(name)) {
          variationMap.set(name, { name, value: 0, profit: 0 });
        }
        
        const variationData = variationMap.get(name)!;
        variationData.value += value;
        variationData.profit += profit;
      }
    });
    
    // Solo crear el array de variaciones si realmente hay datos
    const variationData = hasVariationData ? Array.from(variationMap.values()) : [];
    
    // 3. Datos de tendencias
    const trendMap = new Map<string, TrendData>();
    
    normalizedData.forEach(product => {
      if (product.fecha) {
        // Formatear fecha como YYYY-MM-DD
        let dateStr: string;
        let parsedDate: Date | null = null;
        
        try {
          // Intentar varios formatos de fecha
          const rawDate = product.fecha;
          
          // Si ya es un objeto Date
          if (rawDate instanceof Date) {
            parsedDate = rawDate;
          }
          // Si es un número (posiblemente un timestamp de Excel)
          else if (typeof rawDate === 'number') {
            // Convertir fecha de Excel (días desde 1/1/1900) a timestamp JS
            if (rawDate > 1000) { // Probablemente una fecha de Excel
              const excelEpoch = new Date(1899, 11, 30);
              parsedDate = new Date(excelEpoch.getTime() + rawDate * 24 * 60 * 60 * 1000);
            } else {
              parsedDate = new Date(rawDate); // Intentar como timestamp
            }
          }
          // Si es string, intentar varios formatos
          else {
            const dateStr = String(rawDate);
            
            // Intentar formato ISO
            parsedDate = new Date(dateStr);
            
            // Si no es válida, intentar formatos comunes en español (DD/MM/YYYY)
            if (isNaN(parsedDate.getTime())) {
              const parts = dateStr.split(/[\/\-\.]/);
              if (parts.length === 3) {
                // Asumir DD/MM/YYYY si el primer número es <= 31
                if (parseInt(parts[0]) <= 31) {
                  parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
                }
                // Asumir YYYY/MM/DD si el primer número es > 31 (probablemente un año)
                else {
                  parsedDate = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
                }
              }
            }
          }
          
          // Verificar si la fecha es válida
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            const year = parsedDate.getFullYear();
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const day = String(parsedDate.getDate()).padStart(2, '0');
            dateStr = `${year}-${month}-${day}`;
          } else {
            // Si la fecha no es válida, usar un identificador genérico
            dateStr = 'fecha-' + String(product.fecha).substring(0, 10);
          }
        } catch (e) {
          // En caso de error, usar un valor genérico
          console.error('Error al procesar fecha:', product.fecha, e);
          dateStr = 'fecha-' + String(product.fecha).substring(0, 10);
        }
        
        if (!trendMap.has(dateStr)) {
          trendMap.set(dateStr, { date: dateStr, profit: 0, sales: 0, products: [] });
        }
        
        const trendData = trendMap.get(dateStr)!;
        trendData.profit += this.extractNumber(product.margen) || 0;
        const quantity = this.extractNumber(product.cantidad) || 0;
        trendData.sales += quantity;
        
        // Agregar información del producto vendido en este día
        if (product.nombre && trendData.products) {
          const productName = String(product.nombre);
          // Limpiar el nombre del producto (quitar números al inicio si existen)
          const cleanName = productName.replace(/^[\d\s\-_.:#]+\s*/g, '');
          
          // Asegurar que la cantidad sea al menos 1 si no está especificada
          const safeQuantity = quantity > 0 ? quantity : 1;
          
          // Buscar si ya existe este producto en el array
          const existingProduct = trendData.products.find(p => p.name === cleanName);
          
          if (existingProduct) {
            // Si ya existe, incrementar la cantidad
            existingProduct.quantity += safeQuantity;
          } else {
            // Si no existe, agregar nuevo producto
            trendData.products.push({
              name: cleanName,
              quantity: safeQuantity
            });
          }
        }
      }
    });
    // Ordenar los datos de tendencia por fecha
    const trendData = Array.from(trendMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
      
    // Depurar los datos de productos por día
    console.log('Datos de productos por día:', 
      trendData.map(day => ({
        date: day.date,
        sales: day.sales,
        productCount: day.products?.length || 0
      })));
    
    const result: ProductAnalysisResult = {
      uniqueProductsCount: uniqueProducts.size,
      totalQuantity,
      totalValue,
      totalCost,
      totalProfit,
      averageMargin,
      categoryField,
      productsByCategory: sortedProductsByCategory,
      productsByDepartment: sortedProductsByDepartment,
      productProfitData,
      variationData,
      trendData
    };
    
    console.log('Resultado del análisis de productos:', result);
    return result;
  }
}

export default new ProductsAnalysisService();

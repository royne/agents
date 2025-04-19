import * as XLSX from 'xlsx';

// Tipos para el análisis de órdenes
export interface OrderData {
  id?: string | number;
  fecha?: string | Date;
  numeroGuia?: string;
  estatus?: string;
  tipoEnvio?: string;
  departamento?: string;
  ciudad?: string;
  transportadora?: string;
  valorCompra?: number | string;
  ganancia?: number | string;
  precioFlete?: number | string;
  costoDevolucionFlete?: number | string;
  [key: string]: any; // Para campos adicionales
}

// Campos requeridos para el análisis de órdenes
export const requiredOrderFields = [
  'id', 'fecha', 'numeroGuia', 'estatus', 'tipoEnvio', 'departamento', 
  'ciudad', 'transportadora', 'valorCompra', 'ganancia', 'precioFlete', 'costoDevolucionFlete'
];

// Mapeo de nombres de columnas del Excel a los campos normalizados
export const excelColumnMapping: Record<string, string> = {
  'NÚMERO GUIA': 'numeroGuia',
  'TIPO DE ENVIO': 'tipoEnvio',
  'DEPARTAMENTO DESTINO': 'departamento',
  'CIUDAD DESTINO': 'ciudad',
  'VALOR DE COMPRA EN PRODUCTOS': 'valorCompra',
  'PRECIO FLETE': 'precioFlete',
  'COSTO DEVOLUCION FLETE': 'costoDevolucionFlete'
};

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

// Tipos para los resultados del análisis
export interface OrderAnalysisResult {
  totalOrders: number;
  totalValue: number;
  totalProfit: number;
  totalShippingCost: number;
  totalReturnCost: number;
  groupField: string;
  groupedData: Record<string, number>;
  statusDistribution?: Record<string, number>;
  shippingTypeDistribution?: Record<string, number>;
  regionDistribution?: Record<string, number>;
  carrierDistribution?: Record<string, number>;
}

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

class ExcelAnalysisService {
  /**
   * Lee un archivo Excel y lo convierte a un array de objetos
   */
  public async readExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Obtener la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Datos del Excel:', jsonData[0]);
          resolve(jsonData);
        } catch (error) {
          console.error('Error al procesar Excel:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo Excel'));
      };
      
      // Leer el archivo como binario
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Normaliza los nombres de las columnas para manejar diferentes formatos
   */
  public normalizeColumnNames(data: any[], isOrderAnalysis: boolean = true): any[] {
    if (!data || data.length === 0) return [];
    
    console.log('Datos originales:', data[0]); // Mostrar los nombres de columnas originales para depuración
    
    // Mapeo simplificado para los campos específicos
    const orderColumnMapping: Record<string, string> = {
      // Campos para órdenes
      'id': 'id', 'orden': 'id', 'orden_id': 'id', 'order_id': 'id', 'pedido': 'id', 'pedido_id': 'id',
      'fecha': 'fecha', 'date': 'fecha', 'fecha_orden': 'fecha', 'fecha_pedido': 'fecha',
      'guia': 'numeroGuia', 'numero_guia': 'numeroGuia', 'tracking': 'numeroGuia', 'guia_numero': 'numeroGuia',
      'NÚMERO GUIA': 'numeroGuia', 'NUMERO GUIA': 'numeroGuia',
      'estado': 'estatus', 'status': 'estatus', 'estatus': 'estatus',
      'tipo_envio': 'tipoEnvio', 'tipo_de_envio': 'tipoEnvio', 'shipping_type': 'tipoEnvio',
      'TIPO DE ENVIO': 'tipoEnvio',
      'departamento': 'departamento', 'depto': 'departamento', 'state': 'departamento', 'region': 'departamento',
      'DEPARTAMENTO DESTINO': 'departamento',
      'ciudad': 'ciudad', 'city': 'ciudad', 'municipio': 'ciudad',
      'CIUDAD DESTINO': 'ciudad',
      'transportadora': 'transportadora', 'carrier': 'transportadora', 'empresa_envio': 'transportadora',
      'valor': 'valorCompra', 'valor_compra': 'valorCompra', 'total': 'valorCompra', 'monto': 'valorCompra',
      'VALOR DE COMPRA EN PRODUCTOS': 'valorCompra',
      'ganancia': 'ganancia', 'profit': 'ganancia', 'utilidad': 'ganancia',
      'flete': 'precioFlete', 'precio_flete': 'precioFlete', 'costo_envio': 'precioFlete',
      'PRECIO FLETE': 'precioFlete',
      'devolucion': 'costoDevolucionFlete', 'costo_devolucion': 'costoDevolucionFlete', 'devolucion_flete': 'costoDevolucionFlete',
      'COSTO DEVOLUCION FLETE': 'costoDevolucionFlete'
    };
    
    const productColumnMapping: Record<string, string> = {
      // Campos para productos
      'producto': 'nombre', 'product': 'nombre', 'nombre': 'nombre', 'name': 'nombre', 'item': 'nombre',
      'categoria': 'categoria', 'category': 'categoria', 'tipo': 'categoria', 'type': 'categoria',
      'cantidad': 'cantidad', 'quantity': 'cantidad', 'qty': 'cantidad', 'unidades': 'cantidad',
      'precio': 'precio', 'price': 'precio', 'valor_venta': 'precio',
      'costo': 'costo', 'cost': 'costo', 'precio_costo': 'costo'
    };
    
    const columnMapping = isOrderAnalysis ? orderColumnMapping : productColumnMapping;
    
    // Normalizar los datos
    const result = data.map(item => {
      const normalizedItem: Record<string, any> = {};
      
      Object.keys(item).forEach(key => {
        // Buscar coincidencia exacta primero
        if (columnMapping[key]) {
          normalizedItem[columnMapping[key]] = item[key];
          return;
        }
        
        // Si no hay coincidencia exacta, buscar insensible a mayúsculas/minúsculas
        const lowerKey = key.toLowerCase();
        const normalizedKey = Object.keys(columnMapping).find(k => 
          k.toLowerCase() === lowerKey
        );
        
        if (normalizedKey) {
          normalizedItem[columnMapping[normalizedKey]] = item[key];
        } else {
          // Si no hay coincidencia, mantener el campo original
          normalizedItem[key] = item[key];
        }
      });
      
      return normalizedItem;
    });
    
    // Mostrar el resultado para depuración
    if (result.length > 0) {
      console.log('Datos normalizados:', result[0]);
    }
    
    return result;
  }

  /**
   * Extrae un número de un valor que puede ser string o number
   */
  private extractNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    
    if (typeof value === 'number') return value;
    
    if (typeof value === 'string') {
      // Verificar si el valor es una cadena vacía
      if (value.trim() === '') return 0;
      
      // Manejar formato de moneda (eliminar símbolos de moneda y separadores de miles)
      const cleanValue = value
        .replace(/[^0-9.,]/g, '') // Eliminar todo excepto números, puntos y comas
        .replace(/,/g, '.'); // Reemplazar comas por puntos para manejar decimales
      
      // Si hay múltiples puntos, solo mantener el último como decimal
      const parts = cleanValue.split('.');
      let finalValue = cleanValue;
      
      if (parts.length > 2) {
        const lastPart = parts.pop() || '';
        finalValue = parts.join('') + '.' + lastPart;
      }
      
      console.log(`Convirtiendo valor: '${value}' a número: ${parseFloat(finalValue) || 0}`);
      return parseFloat(finalValue) || 0;
    }
    
    return 0;
  }

  /**
   * Filtra los datos para mostrar solo los campos requeridos
   */
  public filterRequiredFields(data: any[], fields: string[]): any[] {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const filteredItem: Record<string, any> = {};
      fields.forEach(field => {
        filteredItem[field] = item[field];
      });
      return filteredItem;
    });
  }

  /**
   * Analiza los datos de órdenes para calcular totales y distribuciones
   */
  public analyzeOrdersData(data: any[]): OrderAnalysisResult {
    if (!data || data.length === 0) {
      return {
        totalOrders: 0,
        totalValue: 0,
        totalProfit: 0,
        totalShippingCost: 0,
        totalReturnCost: 0,
        groupField: 'departamento',
        groupedData: {},
        statusDistribution: {},
        shippingTypeDistribution: {},
        regionDistribution: {},
        carrierDistribution: {}
      };
    }
    
    console.log('Analizando datos de órdenes, muestra:', data[0]);
    
    // Asegurar que los datos estén normalizados
    const normalizedData = this.normalizeColumnNames(data);
    
    let totalValue = 0;
    let totalProfit = 0;
    let totalShippingCost = 0;
    let totalReturnCost = 0;
    
    // Distribuciones para análisis
    const statusDistribution: Record<string, number> = {};
    const shippingTypeDistribution: Record<string, number> = {};
    const regionDistribution: Record<string, number> = {};
    const carrierDistribution: Record<string, number> = {};
    
    // Analizar cada orden
    normalizedData.forEach((order, index) => {
      if (index === 0) {
        console.log('Procesando primera orden normalizada:', order);
      }
      
      // Sumar valores numéricos
      if (order.valorCompra) {
        const value = this.extractNumber(order.valorCompra);
        if (!isNaN(value)) {
          totalValue += value;
        }
      }
      
      if (order.ganancia) {
        const profit = this.extractNumber(order.ganancia);
        if (!isNaN(profit)) {
          totalProfit += profit;
        }
      }
      
      if (order.precioFlete) {
        const shippingCost = this.extractNumber(order.precioFlete);
        if (!isNaN(shippingCost)) {
          totalShippingCost += shippingCost;
        }
      }
      
      if (order.costoDevolucionFlete) {
        const returnCost = this.extractNumber(order.costoDevolucionFlete);
        if (!isNaN(returnCost)) {
          totalReturnCost += returnCost;
        }
      }
      
      // Contar distribuciones
      if (order.estatus) {
        const status = String(order.estatus || 'Sin estado');
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      }
      
      if (order.tipoEnvio) {
        const type = String(order.tipoEnvio || 'Sin tipo');
        shippingTypeDistribution[type] = (shippingTypeDistribution[type] || 0) + 1;
      }
      
      if (order.departamento) {
        const region = String(order.departamento || 'Sin departamento');
        regionDistribution[region] = (regionDistribution[region] || 0) + 1;
      }
      
      if (order.transportadora) {
        const carrier = String(order.transportadora || 'Sin transportadora');
        carrierDistribution[carrier] = (carrierDistribution[carrier] || 0) + 1;
      }
    });
    
    // Determinar el campo de agrupación y los datos agrupados
    let groupField = 'estatus';
    let groupedData = {...statusDistribution};
    
    if (Object.keys(regionDistribution).length > 0) {
      groupField = 'departamento';
      groupedData = {...regionDistribution};
    }
    
    if (Object.keys(carrierDistribution).length > 0) {
      groupField = 'transportadora';
      groupedData = {...carrierDistribution};
    }
    
    // Ordenar los datos agrupados por cantidad (descendente)
    const sortedGroupedData = Object.fromEntries(
      Object.entries(groupedData).sort(([, a], [, b]) => b - a)
    );
    
    const result: OrderAnalysisResult = {
      totalOrders: normalizedData.length,
      totalValue,
      totalProfit,
      totalShippingCost,
      totalReturnCost,
      groupField,
      groupedData: sortedGroupedData,
      statusDistribution,
      shippingTypeDistribution,
      regionDistribution,
      carrierDistribution
    };
    
    console.log('Resultado del análisis:', result);
    return result;
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
    const normalizedData = this.normalizeColumnNames(data, false);
    
    let totalQuantity = 0;
    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let marginSum = 0;
    let marginCount = 0;
    
    // Encontrar el campo de categoría
    const categoryField = this.findCategoryField(normalizedData);
    const productsByCategory: Record<string, number> = {};
    
    // Conjunto de productos únicos (por ID o nombre)
    const uniqueProducts = new Set<string>();
    
    // Analizar cada producto
    normalizedData.forEach(product => {
      // Identificar producto único
      const productId = product.id || product.nombre || 'Sin identificador';
      uniqueProducts.add(String(productId));
      
      // Sumar cantidades
      if (product.cantidad) {
        const quantity = this.extractNumber(product.cantidad);
        if (!isNaN(quantity)) {
          totalQuantity += quantity;
        }
      }
      
      // Sumar valores
      if (product.precio) {
        const price = this.extractNumber(product.precio);
        if (!isNaN(price)) {
          totalValue += price;
        }
      }
      
      if (product.costo) {
        const cost = this.extractNumber(product.costo);
        if (!isNaN(cost)) {
          totalCost += cost;
        }
      }
      
      // Calcular margen
      if (product.margen) {
        const margin = this.extractNumber(product.margen);
        if (!isNaN(margin)) {
          marginSum += margin;
          marginCount++;
        }
      } else if (product.precio && product.costo) {
        const price = this.extractNumber(product.precio);
        const cost = this.extractNumber(product.costo);
        if (!isNaN(price) && !isNaN(cost) && cost > 0) {
          const margin = (price - cost) / price * 100;
          marginSum += margin;
          marginCount++;
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
    const averageMargin = marginCount > 0 ? marginSum / marginCount : 0;
    
    return {
      uniqueProductsCount: uniqueProducts.size,
      totalQuantity,
      totalValue,
      totalCost,
      totalProfit,
      averageMargin,
      categoryField,
      productsByCategory
    };
  }

  /**
   * Encuentra el campo de categoría en los datos
   */
  private findCategoryField(data: any[]): string | null {
    if (!data || data.length === 0) return null;
    
    const possibleFields = ['categoria', 'category', 'tipo', 'type'];
    const firstItem = data[0];
    
    for (const field of possibleFields) {
      if (firstItem[field] !== undefined) {
        return field;
      }
    }
    
    return null;
  }
}

export default new ExcelAnalysisService();

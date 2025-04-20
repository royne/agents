import BaseExcelService from './BaseExcelService';
import OrdersAnalysisService, { OrderAnalysisResult } from './OrdersAnalysisService';
import ProductsAnalysisService, { ProductAnalysisResult } from './ProductsAnalysisService';

/**
 * Servicio principal que orquesta el análisis de datos de Excel
 * Delega las operaciones específicas a los servicios especializados
 */
class ExcelAnalysisService extends BaseExcelService {
  /**
   * Analiza los datos de órdenes para calcular totales y distribuciones
   * Delega al servicio especializado de órdenes
   */
  public analyzeOrdersData(data: any[]): OrderAnalysisResult {
    return OrdersAnalysisService.analyzeOrdersData(data);
  }
  
  /**
   * Analiza los datos de productos
   * Delega al servicio especializado de productos
   */
  public analyzeProductsData(data: any[]): ProductAnalysisResult {
    return ProductsAnalysisService.analyzeProductsData(data);
  }
  
  /**
   * Determina automáticamente el tipo de datos (órdenes o productos)
   * y realiza el análisis correspondiente
   */
  public autoDetectAndAnalyze(data: any[]): OrderAnalysisResult | ProductAnalysisResult {
    if (!data || data.length === 0) {
      throw new Error('No hay datos para analizar');
    }
    
    // Detectar si los datos son de órdenes o productos
    const firstItem = data[0];
    const keys = Object.keys(firstItem).map(k => k.toLowerCase());
    
    // Palabras clave que indican datos de órdenes
    const orderKeywords = ['guia', 'orden', 'pedido', 'estatus', 'transportadora', 'flete'];
    
    // Palabras clave que indican datos de productos
    const productKeywords = ['producto', 'categoria', 'margen', 'inventario', 'stock'];
    
    let orderMatches = 0;
    let productMatches = 0;
    
    // Contar coincidencias de palabras clave
    keys.forEach(key => {
      orderKeywords.forEach(keyword => {
        if (key.includes(keyword)) orderMatches++;
      });
      
      productKeywords.forEach(keyword => {
        if (key.includes(keyword)) productMatches++;
      });
    });
    
    console.log(`Detección automática: coincidencias de órdenes=${orderMatches}, coincidencias de productos=${productMatches}`);
    
    // Determinar el tipo de datos basado en la mayor cantidad de coincidencias
    if (orderMatches >= productMatches) {
      console.log('Detectado como datos de órdenes');
      return this.analyzeOrdersData(data);
    } else {
      console.log('Detectado como datos de productos');
      return this.analyzeProductsData(data);
    }
  }
}

// Exportar una instancia única del servicio
export type { OrderAnalysisResult, ProductAnalysisResult };
export default new ExcelAnalysisService();

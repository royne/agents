import * as XLSX from 'xlsx';

/**
 * Servicio base para el procesamiento de archivos Excel
 * Contiene la lógica común para todos los tipos de análisis
 */
class BaseExcelService {
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
   * @param data Datos a normalizar
   * @param columnMapping Mapeo de nombres de columnas
   */
  protected normalizeColumnNames(data: any[], columnMapping: Record<string, string>): any[] {
    if (!data || data.length === 0) return [];
    
    console.log('Datos originales:', data[0]); // Mostrar los nombres de columnas originales para depuración
    
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
  protected extractNumber(value: any): number {
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
}

export default BaseExcelService;

import * as XLSX from 'xlsx';
import { BaseCarrier } from '../services/database/carrierDatabaseService';

/**
 * Lista de transportadoras que pueden aparecer en el Excel
 */
const CARRIER_COLUMNS = [
  'TCC',
  'ENVIA',
  'COORDINADORA',
  'INTERRAPIDISIMO',
  'DOMINA',
  'VELOCES',
  'WILLOG',
  'FUTURA'
];

/**
 * Lee un archivo Excel y extrae los datos de transportadoras
 * @param file Archivo Excel a procesar
 * @returns Array de datos de transportadoras
 */
export const readCarriersFromExcel = (file: File): Promise<BaseCarrier[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        const carriers: BaseCarrier[] = [];
        
        jsonData.forEach((row: any) => {
          const state = row['DEPARTAMENTO'];
          const city = row['MUNICIPIO'];
          
          if (!state || !city) return;
          
          CARRIER_COLUMNS.forEach(carrierName => {
            if (row[carrierName] && (row[carrierName].toString().toUpperCase() === 'X')) {
              carriers.push({
                name: carrierName,
                city: city,
                state: state
              });
            }
          });
        });
        
        resolve(carriers);
      } catch (error) {
        console.error('Error al procesar el archivo Excel:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    reader.readAsArrayBuffer(file);
  });
};

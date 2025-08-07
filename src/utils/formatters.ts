/**
 * Utilidades para formatear valores
 */

/**
 * Formatea un valor numérico como moneda (USD)
 * @param value - Valor a formatear
 * @returns String formateado como moneda
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formatea un valor numérico como porcentaje
 * @param value - Valor a formatear (0.1 = 10%)
 * @returns String formateado como porcentaje
 */
export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
};

/**
 * Formatea un número con separadores de miles
 * @param value - Valor a formatear
 * @returns String formateado con separadores de miles
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-CO').format(value);
};

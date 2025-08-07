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
 * Formatea un valor numérico con separadores de miles
 * @param value - Valor a formatear
 * @returns String formateado con separadores de miles
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formatea una fecha en formato legible (DD/MM/YYYY)
 * @param dateString - String de fecha ISO o Date
 * @returns String formateado como fecha
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// La función formatNumber ya está definida arriba

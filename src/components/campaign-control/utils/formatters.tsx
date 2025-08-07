/**
 * Formatea un número como moneda en formato COP
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formatea una fecha ISO a formato local
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Formatea una hora ISO a formato local (solo hora)
 */
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

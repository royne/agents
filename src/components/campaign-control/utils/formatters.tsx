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
 * Formatea una fecha ISO a formato local, asegurando que se muestre la fecha correcta
 */
export const formatDate = (dateString: string): string => {
  // Crear una fecha a partir del string
  const inputDate = new Date(dateString);
  
  // Crear una nueva fecha usando los componentes de año, mes y día para evitar problemas de zona horaria
  const year = inputDate.getFullYear();
  const month = inputDate.getMonth();
  const day = inputDate.getDate();
  
  // Crear una nueva fecha con estos componentes (esto evita el problema de zona horaria)
  const correctedDate = new Date(year, month, day);
  
  // Formatear la fecha en formato local
  return correctedDate.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
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

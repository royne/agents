/**
 * Estilos para scrollbars personalizados
 */

export const scrollbarStyles = {
  // Clases CSS para scrollbars personalizados
  scrollbarClass: "custom-scrollbar",
  scrollbarHorizontalClass: "custom-scrollbar-horizontal",
  
  // Clase CSS para aplicar a elementos con scroll vertical
  scrollContainer: "p-2 overflow-auto rounded-md custom-scrollbar",
  
  // Clase CSS para tablas con scroll horizontal
  tableScrollContainer: "overflow-x-auto rounded-md custom-scrollbar-horizontal"
};

// Crear estilos CSS globales para los scrollbars
export const createGlobalScrollbarStyles = (): void => {
  // Verificar si los estilos ya existen
  if (document.getElementById('custom-scrollbar-styles')) return;
  
  const styleElement = document.createElement('style');
  styleElement.id = 'custom-scrollbar-styles';
  styleElement.textContent = `
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(113, 128, 150, 0.4) rgba(26, 32, 44, 0.1);
    }
    
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(26, 32, 44, 0.1);
      border-radius: 10px;
      margin: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(113, 128, 150, 0.4);
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(113, 128, 150, 0.6);
    }
    
    .custom-scrollbar-horizontal {
      scrollbar-width: thin;
      scrollbar-color: rgba(113, 128, 150, 0.4) rgba(26, 32, 44, 0.1);
    }
    
    .custom-scrollbar-horizontal::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .custom-scrollbar-horizontal::-webkit-scrollbar-track {
      background: rgba(26, 32, 44, 0.1);
      border-radius: 10px;
      margin: 4px;
    }
    
    .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
      background: rgba(113, 128, 150, 0.4);
      border-radius: 10px;
    }
    
    .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
      background: rgba(113, 128, 150, 0.6);
    }
  `;
  
  document.head.appendChild(styleElement);
};

/**
 * Aplica estilos de scrollbar personalizados a un elemento
 * @param elementId ID del elemento al que aplicar los estilos
 * @param isHorizontal Si es true, aplica estilos para scrollbar horizontal
 */
export const applyScrollbarStyles = (elementId: string, isHorizontal: boolean = false): void => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  // Asegurarse de que los estilos globales estén creados
  createGlobalScrollbarStyles();
  
  // Aplicar la clase adecuada
  if (isHorizontal) {
    element.classList.add('custom-scrollbar-horizontal');
  } else {
    element.classList.add('custom-scrollbar');
  }
};

export default scrollbarStyles;

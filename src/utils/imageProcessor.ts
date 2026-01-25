/**
 * Utilidad "Sharp-less" para procesar imágenes en el cliente.
 * Evita sobrecargar el servidor y reduce el consumo de ancho de banda.
 */
export const processImageForUpload = (file: File, maxDimension: number = 800): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcular nuevas dimensiones manteniendo el aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exportar a WebP de alta eficiencia
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al convertir imagen a WebP'));
            }
          },
          'image/webp',
          0.85 // Calidad equilibrada
        );
      };
      
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
};

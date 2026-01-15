import React from 'react';
import AppTour from '../common/AppTour';

const ImageProTour: React.FC = () => {
  return (
    <AppTour
      tourId="image_pro_v1"
      steps={[
        {
          element: '#tour-image-modes',
          popover: {
            title: 'Modos de Generación',
            description: 'Elige entre Libre (creatividad total), Ads (optimizado para pauta) o Personas (para modelos y face swap).',
            side: 'bottom'
          }
        },
        {
          element: '#tour-image-product',
          popover: {
            title: 'Imagen Base',
            description: 'Sube la foto de tu producto o el modelo principal. Es la referencia esencial para la IA.',
            side: 'right'
          }
        },
        {
          element: '#tour-image-style',
          popover: {
            title: 'Estilo y Referencias',
            description: 'Carga una imagen de referencia o usa nuestra biblioteca para definir la estética visual.',
            side: 'right'
          }
        },
        {
          element: '#tour-image-context',
          popover: {
            title: 'Contexto Estratégico',
            description: 'Define el nombre, ángulo de venta y tu cliente ideal. ¡Esto ayuda a la IA a ser más precisa y darte el mejor resultado!',
            side: 'top'
          }
        },
        {
          element: '#tour-image-instructions',
          popover: {
            title: 'Instrucciones y detalles',
            description: 'Ingresa los detalles específicos del producto para que la IA sepa que hace el producto y parta de ello para tomar contexto. ¿Algún detalle específico? Aquí puedes guiar a la IA con detalles exactos de lo que buscas.',
            side: 'top'
          }
        },
        {
          element: '#tour-image-generate',
          popover: {
            title: '¡Crear Imagen!',
            description: 'Haz clic aquí para iniciar el proceso de generación con Inteligencia Artificial.',
            side: 'top'
          }
        }
      ]}
    />
  );
};

export default ImageProTour;

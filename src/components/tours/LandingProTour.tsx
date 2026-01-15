import React from 'react';
import AppTour from '../common/AppTour';

const LandingProTour: React.FC = () => {
  return (
    <AppTour
      tourId="landing_pro_v1"
      steps={[
        {
          element: '#tour-plan-selector',
          popover: {
            title: 'Elige tu Modalidad',
            description: 'Selecciona entre Completo (toda la landing), Flash (rápida) o Sección individual según necesites.',
            side: 'bottom'
          }
        },
        {
          element: '#tour-product-photo',
          popover: {
            title: 'Foto del Producto',
            description: 'Sube una foto real de tu producto. Es el núcleo obligatorio para que la IA haga su magia.',
            side: 'right'
          }
        },
        {
          element: '#tour-branding-style',
          popover: {
            title: 'Estilo y Branding',
            description: 'Usa nuestra biblioteca de estilos o sube una referencia para que la IA siga tu línea gráfica.',
            side: 'right'
          }
        },
        {
          element: '#tour-context-trigger',
          popover: {
            title: 'Información del Producto',
            description: 'Completa el nombre y el ángulo de venta. ¡detallalo lo mejor posible para que tengas un diseño más preciso!',
            side: 'top'
          }
        },
        {
          element: '#tour-instructions',
          popover: {
            title: 'Instrucciones y detalles del producto',
            description: 'Ingresa la información del producto para que la IA sepa que hace el producto y parta de ello para tomar contexto. ¿Algún detalle específico? Puedes guiar a la IA con detalles exactos de lo que buscas.',
            side: 'top'
          }
        },
        {
          element: '#tour-generate-button',
          popover: {
            title: 'Lanzar Generación',
            description: '¡Todo listo! Haz clic aquí para que la IA empiece a diseñar tu landing de alta conversión.',
            side: 'top'
          }
        }
      ]}
    />
  );
};

export default LandingProTour;

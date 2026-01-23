import React from 'react';
import AppTour from '../common/AppTour';

const DashboardTour: React.FC = () => {
  return (
    <AppTour
      tourId="dashboard_v2"
      steps={[
        {
          element: '#tour-welcome',
          popover: {
            title: '¡Bienvenido a DROPAPP!',
            description: 'Este es tu centro de estrategia para escalar tu e-commerce con Inteligencia Artificial.',
            side: 'bottom'
          }
        },
        {
          element: '#tour-v2-create-btn',
          popover: {
            title: 'Inicia un Proyecto',
            description: 'Haz clic aquí para lanzar una estrategia completa con IA o usar nuestras herramientas individuales.',
            side: 'left'
          }
        },
        {
          element: '#tour-sidebar',
          popover: {
            title: 'Navegación Inteligente',
            description: 'Desde aquí puedes acceder a todas las potentes herramientas de DropApp.',
            side: 'right'
          }
        },
        {
          element: '#tour-tutorials-step',
          popover: {
            title: 'Domina la Plataforma',
            description: '¿Necesitas ayuda? En la sección de tutoriales encontrarás guías detalladas para cada módulo.',
            side: 'right'
          }
        }
      ]}
    />
  );
};

export default DashboardTour;

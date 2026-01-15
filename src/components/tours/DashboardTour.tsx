import React from 'react';
import AppTour from '../common/AppTour';

const DashboardTour: React.FC = () => {
  return (
    <AppTour
      tourId="dashboard_v1"
      steps={[
        {
          element: '#tour-welcome',
          popover: {
            title: '¡Bienvenido a DROPAPP!',
            description: 'Este es tu centro de comando para escalar tu e-commerce con Inteligencia Artificial.',
            side: 'bottom'
          }
        },
        {
          element: '#tour-credits',
          popover: {
            title: 'Tus Créditos',
            description: 'Aquí puedes ver tus créditos disponibles y tu plan actual. Los créditos se consumen al generar contenido con IA.',
            side: 'bottom'
          }
        },
        {
          element: '#tour-landing-card',
          popover: {
            title: 'Crea Landings de Impacto',
            description: 'Usa nuestra IA para generar páginas de aterrizaje optimizadas para conversión en minutos.',
            side: 'right'
          }
        },
        {
          element: '#tour-tutorials',
          popover: {
            title: '¿Tienes dudas?',
            description: 'En la sección de tutoriales encontrarás guías paso a paso para dominar todas las herramientas de la plataforma.',
            side: 'top'
          }
        }
      ]}
    />
  );
};

export default DashboardTour;

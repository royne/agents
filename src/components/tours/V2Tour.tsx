import React from 'react';
import AppTour from '../common/AppTour';

const V2Tour: React.FC = () => {
  return (
    <AppTour
      tourId="v2_creation_tour"
      steps={[
        {
          element: '#tour-v2-title',
          popover: {
            title: 'Estratega Pro',
            description: 'Bienvenido al generador de estrategias completas. Aquí la IA se encarga de todo el proceso creativo.',
            side: 'bottom'
          }
        },
        {
          element: '#tour-v2-chat',
          popover: {
            title: 'Tu Director Creativo',
            description: 'Carga la imagen de tu producto aquí y la IA investigara para definir la dirección de tu campaña.',
            side: 'right'
          }
        },
        {
          element: '#tour-v2-canvas',
          popover: {
            title: 'El Lienzo (Canva)',
            description: 'Aquí verás aparecer tus diseños, anuncios y landing pages. Desde este panel podrás gestionar y refinar cada pieza.',
            side: 'left'
          }
        }
      ]}
    />
  );
};

export default V2Tour;

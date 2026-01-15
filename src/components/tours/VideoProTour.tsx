import React from 'react';
import AppTour from '../common/AppTour';

const VideoProTour: React.FC = () => {
  return (
    <AppTour
      tourId="video_pro_v1"
      steps={[
        {
          element: '#tour-video-context',
          popover: {
            title: 'Contexto del Producto',
            description: 'Define el nombre y el ángulo de venta. ¡Esto ayuda a la IA a entender qué quieres destacar!',
            side: 'bottom'
          }
        },
        {
          element: '#tour-video-modes',
          popover: {
            title: 'Modos de Video',
            description: 'Elige entre Rápido (8s) o Interpolación (movimiento entre dos imágenes).',
            side: 'bottom'
          }
        },
        {
          element: '#tour-video-reference',
          popover: {
            title: 'Imagen Inicial',
            description: 'Sube la imagen base. Es el punto de partida visual para generar el movimiento del video.',
            side: 'right'
          }
        },
        {
          element: '#tour-video-script',
          popover: {
            title: 'Guion del Video',
            description: 'Escribe aquí el guion literal que dirá o hará el personaje. Es fundamental para un buen resultado (aunque también acepta instrucciones).',
            side: 'top'
          }
        },
        {
          element: '#tour-video-specs',
          popover: {
            title: 'Configuración de Voz',
            description: 'Personaliza el acento y tono de la voz para que encaje perfectamente con tu marca.',
            side: 'top'
          }
        },
        {
          element: '#tour-video-generate',
          popover: {
            title: '¡Crear Video!',
            description: '¡Todo listo! Haz clic aquí para enviar a renderizar tu video profesional.',
            side: 'top'
          }
        }
      ]}
    />
  );
};

export default VideoProTour;

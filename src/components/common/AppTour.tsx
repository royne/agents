import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side?: 'left' | 'right' | 'top' | 'bottom';
    align?: 'start' | 'center' | 'end';
  };
}

interface AppTourProps {
  tourId: string;
  steps: TourStep[];
  autoStart?: boolean;
}

const AppTour: React.FC<AppTourProps> = ({ tourId, steps, autoStart = true }) => {
  useEffect(() => {
    // Verificar si el tour ya fue completado
    const isCompleted = localStorage.getItem(`tour_done_${tourId}`);

    if (autoStart && !isCompleted) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: '#000000',
        overlayOpacity: 0.8,
        stagePadding: 4,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Entendido',
        progressText: '{{current}} de {{total}}',
        steps: steps.map(step => ({
          element: step.element,
          popover: {
            title: `<span class="tour-title">${step.popover.title}</span>`,
            description: `<span class="tour-description">${step.popover.description}</span>`,
            side: step.popover.side,
            align: step.popover.align,
          }
        })),
        onDestroyed: () => {
          localStorage.setItem(`tour_done_${tourId}`, 'true');
        }
      });

      // Pequeño timeout para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        driverObj.drive();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [tourId, steps, autoStart]);

  return null;
};

export default AppTour;

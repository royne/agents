import React from 'react';
import { FaCircle, FaPause, FaPlay, FaExclamationTriangle, FaQuestion } from 'react-icons/fa';
import { TbArrowBigUpFilled, TbArrowBigDownFilled } from 'react-icons/tb';

// Función para obtener el color según el estado de la campaña
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return '0, 200, 83'; // Verde
    case 'paused':
      return '255, 152, 0'; // Naranja
    case 'limited':
      return '244, 67, 54'; // Rojo
    case 'learning':
      return '33, 150, 243'; // Azul
    default:
      return '158, 158, 158'; // Gris
  }
};

// Función para obtener el texto según el estado de la campaña
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Activa';
    case 'paused':
      return 'Pausada';
    case 'limited':
      return 'Limitada';
    case 'learning':
      return 'En aprendizaje';
    default:
      return 'Desconocido';
  }
};

// Función para obtener el ícono según el estado de la campaña
export const getStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case 'active':
      return <FaPlay className="text-green-500" />;
    case 'paused':
      return <FaPause className="text-yellow-500" />;
    case 'limited':
      return <FaExclamationTriangle className="text-red-500" />;
    case 'learning':
      return <FaCircle className="text-blue-500" />;
    default:
      return <FaQuestion className="text-gray-500" />;
  }
};

// Función para obtener el ícono según el tipo de cambio
export const getChangeTypeIcon = (changeType: string): React.ReactNode => {
  switch (changeType) {
    case 'increase':
      return <TbArrowBigUpFilled className="text-green-500" />;
    case 'decrease':
      return <TbArrowBigDownFilled className="text-red-500" />;
    case 'pause':
      return <FaPause className="text-yellow-500" />;
    case 'resume':
      return <FaPlay className="text-green-500" />;
    default:
      return <FaQuestion className="text-gray-500" />;
  }
};

// Componente para mostrar un badge de estado
interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: `rgba(${getStatusColor(status)}, 0.2)`,
        color: `rgb(${getStatusColor(status)})` 
      }}
    >
      <span className="mr-1">{getStatusIcon(status)}</span>
      {getStatusText(status)}
    </span>
  );
};

export default StatusBadge;

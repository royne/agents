import React from 'react';
import { FaArrowUp, FaArrowDown, FaPlay, FaPause, FaCircle } from 'react-icons/fa';

// Función para formatear moneda
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Obtener el color de estado para una campaña
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'paused': return 'bg-yellow-500';
    case 'limited': return 'bg-orange-500';
    case 'learning': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

// Obtener el texto de estado para una campaña
export const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Activa';
    case 'paused': return 'Pausada';
    case 'limited': return 'Limitada';
    case 'learning': return 'En aprendizaje';
    default: return 'Desconocido';
  }
};

// Obtener el ícono de estado para una campaña
export const getStatusIcon = (status: string): React.ReactNode => {
  switch (status) {
    case 'active': return <FaPlay className="text-green-500" />;
    case 'paused': return <FaPause className="text-yellow-500" />;
    case 'limited': return <FaCircle className="text-orange-500" />;
    case 'learning': return <FaCircle className="text-blue-500" />;
    default: return <FaCircle className="text-gray-500" />;
  }
};

// Obtener el color para el tipo de cambio
export const getChangeTypeColor = (changeType: string) => {
  switch (changeType) {
    case 'increase': return 'text-green-500';
    case 'decrease': return 'text-red-500';
    case 'pause': return 'text-yellow-500';
    case 'resume': return 'text-blue-500';
    default: return 'text-gray-500';
  }
};

// Obtener el ícono para el tipo de cambio
export const getChangeTypeIcon = (changeType: string): React.ReactNode => {
  switch (changeType) {
    case 'increase': return <FaArrowUp className="text-green-500" />;
    case 'decrease': return <FaArrowDown className="text-red-500" />;
    case 'pause': return <FaPause className="text-yellow-500" />;
    case 'resume': return <FaPlay className="text-blue-500" />;
    default: return <FaCircle className="text-gray-500" />;
  }
};

// Formatear fecha y hora
export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
};

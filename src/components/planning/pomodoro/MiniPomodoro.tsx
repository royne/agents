import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaTimes } from 'react-icons/fa';
import '../../../styles/pomodoro.css';

interface MiniPomodoroProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

const MiniPomodoro: React.FC<MiniPomodoroProps> = ({ taskId, taskTitle, onClose }) => {
  // Duración del pomodoro en segundos (25 minutos)
  const DEFAULT_TIME = 25 * 60;
  
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(true);
  const [startTime, setStartTime] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Formatear el tiempo en minutos:segundos
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Formatear la hora de inicio
  const formatStartTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Iniciar el temporizador
  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current as NodeJS.Timeout);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Pausar el temporizador
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };
  
  // Reiniciar el temporizador
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimeLeft(DEFAULT_TIME);
    setStartTime(new Date());
    setIsRunning(true);
    startTimer();
  };
  
  // Iniciar el temporizador cuando el componente se monta
  useEffect(() => {
    startTimer();
    
    // Limpiar el intervalo cuando el componente se desmonta
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Mostrar notificación cuando el temporizador llegue a cero
  useEffect(() => {
    if (timeLeft === 0) {
      // Aquí se podría implementar una notificación
      console.log('¡Tiempo de Pomodoro completado!');
    }
  }, [timeLeft]);
  
  return (
    <div className="fixed bottom-4 right-8 z-50 w-64 h-64 bg-black border-2 border-red-600 rounded-full shadow-lg overflow-visible mini-pomodoro flex flex-col justify-center items-center">
      {/* Botón de cierre como un círculo rojo en la parte superior */}
      <button 
        onClick={onClose}
        className="absolute -top-1 -right-1 bg-red-600 text-white hover:bg-red-500 p-1 rounded-full transition-colors mini-pomodoro-button shadow-md border border-white"
        aria-label="Cerrar pomodoro"
        style={{ zIndex: 60 }}
      >
        <FaTimes size={12} />
      </button>
      
      {/* Título del pomodoro */}
      <div className="text-xs font-bold text-white mb-1">Pomodoro</div>
      
      {/* Reloj digital estilo LED */}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="led-display text-4xl font-bold text-red-600 bg-black py-2 px-2 rounded-full border border-red-800 w-3/4 text-center tracking-widest led-glow">
          {formatTime(timeLeft)}
        </div>
        
        {/* Controles del temporizador */}
        <div className="flex justify-center gap-3 mt-3">
          {isRunning ? (
            <button 
              onClick={pauseTimer}
              className="bg-red-800 hover:bg-red-700 text-white p-2 rounded-full transition-colors mini-pomodoro-button"
              aria-label="Pausar"
            >
              <FaPause size={12} />
            </button>
          ) : (
            <button 
              onClick={startTimer}
              className="bg-red-800 hover:bg-red-700 text-white p-2 rounded-full transition-colors mini-pomodoro-button"
              aria-label="Iniciar"
            >
              <FaPlay size={12} />
            </button>
          )}
          
          <button 
            onClick={resetTimer}
            className="bg-red-800 hover:bg-red-700 text-white p-2 rounded-full transition-colors mini-pomodoro-button"
            aria-label="Reiniciar"
          >
            <FaRedo size={12} />
          </button>
        </div>
        
        {/* Información de la tarea */}
        <div className="mt-3 text-xs text-gray-300 w-3/4 text-center">
          <div className="truncate font-semibold">{taskTitle}</div>
          <div className="text-gray-400 text-xs">Inicio: {formatStartTime(startTime)}</div>
        </div>
      </div>
    </div>
  );
};

export default MiniPomodoro;

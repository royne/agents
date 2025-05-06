import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Event } from '../components/planning/schedule/ScheduleEvent';

interface PomodoroContextType {
  activeTask: Event | null;
  isPomodorActive: boolean;
  startPomodoro: (task: Event) => void;
  stopPomodoro: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTask, setActiveTask] = useState<Event | null>(null);
  const [isPomodorActive, setIsPomodorActive] = useState(false);

  const startPomodoro = (task: Event) => {
    setActiveTask(task);
    setIsPomodorActive(true);
  };

  const stopPomodoro = () => {
    setActiveTask(null);
    setIsPomodorActive(false);
  };

  return (
    <PomodoroContext.Provider value={{ 
      activeTask, 
      isPomodorActive, 
      startPomodoro, 
      stopPomodoro 
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoroContext = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoroContext must be used within a PomodoroProvider');
  }
  return context;
};

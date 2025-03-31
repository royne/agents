import { useState, useEffect } from 'react';
import { USERS } from '../data/users';

const AUTH_STORAGE_KEY = 'auth_data';

interface AuthData {
  username: string;
  role: string;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        setAuthData(JSON.parse(storedAuth));
      } catch (error) {
        console.error('Error parsing auth data:', error);
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = USERS[username];
    if (user && user.password === password) {
      const newAuthData = {
        username: user.username,
        role: user.role,
        isAuthenticated: true
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthData));
      setAuthData(newAuthData);
      setIsLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthData(null);
    setIsLoginModalOpen(true);
  };

  return {
    authData,
    isLoginModalOpen,
    login,
    logout
  };
};

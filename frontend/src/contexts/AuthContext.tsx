"use client";
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import jwtDecode from 'jwt-decode'; 
import { User, DecodedToken, AuthState } from '@/types';
import { getMe } from '@/services/api';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setTokenState(storedToken);
          getMe().then(response => {
            setUserState(response.data.user);
          }).catch(() => {
            localStorage.removeItem('token');
            setUserState(null);
            setTokenState(null);
          }).finally(() => {
            setIsLoading(false);
          });
        } else {
          localStorage.removeItem('token');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error decoding token on initial load:", error);
        localStorage.removeItem('token');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    setTokenState(newToken);
    setUserState(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setTokenState(null);
    setUserState(null);
  };
  
  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        isAuthenticated: !!token && !!user, 
        isLoading,
        login, 
        logout,
        setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
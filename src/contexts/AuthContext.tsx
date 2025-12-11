import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  name: string;
  lastname: string;
  email: string;
  role: string;
}

interface JWTPayload {
  expire: string;
  name: string;
  lastname: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  hasPermission: (action: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      try {
        // Verificar si el token ha expirado
        const decoded = jwtDecode<JWTPayload>(token);
        const expireDate = new Date(decoded.expire);
        
        if (expireDate > new Date()) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          // Token expirado, limpiar todo
          logout();
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
        logout();
      }
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Crear el cuerpo de la petición en formato x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('grant_type', 'password');
      formData.append('username', email);
      formData.append('password', password);
      formData.append('scope', '');
      formData.append('client_id', 'string');
      formData.append('client_secret', 'string');

      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        credentials: 'include', // Para enviar/recibir cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al iniciar sesión. Por favor verifica tus credenciales.');
      }

      const data = await response.json();
      
      // Decodificar el JWT para obtener los datos del usuario usando jwt-decode
      const tokenPayload = jwtDecode<JWTPayload>(data.access_token);
      
      const userData: User = {
        name: tokenPayload.name,
        lastname: tokenPayload.lastname,
        email: tokenPayload.email,
        role: tokenPayload.role,
      };

      // Guardar el token y datos del usuario solo si rememberMe es true
      if (rememberMe) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        localStorage.setItem('user_data', JSON.stringify(userData));
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (action: string) => {
    // Por ahora todos los usuarios autenticados tienen los mismos permisos
    return isAuthenticated;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
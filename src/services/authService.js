import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const authService = {
  login: async (email, password) => {
    try {
      // TODO: Reemplazar con tu endpoint real
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
  },

  logout: async () => {
    try {
      // TODO: Reemplazar con tu endpoint real si es necesario
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },

  validateToken: async (token) => {
    try {
      // TODO: Reemplazar con tu endpoint real
      const response = await axios.get(`${API_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

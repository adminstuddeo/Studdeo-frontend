/**
 * Configuración de la API
 * Centraliza todas las URLs y configuraciones relacionadas con la API
 */

// URL base de la API - cambiar aquí para todos los entornos
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://protective-manifestation-production.up.railway.app';

/**
 * Endpoints de la API
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
  },
  profesores: {
    base: '/profesores/',
    alreadyMapped: '/profesores/?already_mapped=true',
  },
  sales: {
    base: '/sales/',
  },
  courses: {
    base: '/course/',
    lessons: (external_reference: string) => `/course/${external_reference}/lessons`,
    students: (external_reference: string) => `/course/${external_reference}/students?course_id=${external_reference}`,
  },
  administrator: {
    courses: '/administrator/courses',
    lessons: (external_reference: string) => `/administrator/courses/${external_reference}/lessons`,
    students: (external_reference: string) => `/administrator/courses/${external_reference}/students`,
  },
  user: {
    create: '/users/',
  },
  // Agregar más endpoints aquí según sea necesario
} as const;

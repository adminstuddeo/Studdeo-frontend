import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SideBar from '../components/Dashboard/SideBar';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import { DollarSign, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { authenticatedFetchJSON } from '../lib/api';
import { API_ENDPOINTS } from '../config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Buyer {
  external_reference: number;
  name: string;
  emai: string;
  phone: string;
}

interface DetailSale {
  price: number;
  quantity: number;
  external_reference: number;
}

interface Sale {
  external_reference: number;
  date: string;
  details_sale: DetailSale[];
  buyer: Buyer;
  discount: number;
  total: number;
}

interface CourseWithSales {
  external_reference: number;
  name: string;
  description: string;
  product_id: number;
  user_id: number;
  create_date: string;
  sales: Sale[];
  calculated_total: number;
}

interface Lesson {
  id: number;
  name: string;
  description: string;
  external_reference: string;
  order: number;
}

interface Student {
  external_reference: number;
  name: string;
  email: string;
  phone: string;
}

interface AdminCourse {
  external_reference: number;
  name: string;
  description: string;
  product_id: number;
  user_id: number;
  create_date: string;
  students_count: number;
  lessons_count: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<CourseWithSales[]>([]);
  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [coursesLoaded, setCoursesLoaded] = useState(false); // Nueva bandera para saber si ya se cargaron
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'graficos' | 'cursos'>('graficos');
  
  // Filtros que se aplican automáticamente
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90' | 'all'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const isAdmin = user?.role_name === 'administrator';

  // Constantes de caché
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
  const SALES_CACHE_KEY = 'dashboard_sales_cache';
  const COURSES_CACHE_KEY = 'dashboard_courses_cache';

  // Utilidad para obtener datos del caché
  const getCachedData = <T,>(key: string): T | null => {
    try {
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar si el caché es válido (no ha expirado)
      if (now - timestamp < CACHE_DURATION) {
        console.log(`✅ Usando datos del caché para ${key}`);
        return data as T;
      }
      
      // Caché expirado, eliminar
      sessionStorage.removeItem(key);
      return null;
    } catch (error) {
      console.error('Error al leer del caché:', error);
      return null;
    }
  };

  // Utilidad para guardar datos en el caché
  const setCachedData = <T,>(key: string, data: T): void => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(key, JSON.stringify(cacheData));
      console.log(`💾 Datos guardados en caché para ${key}`);
    } catch (error) {
      console.error('Error al guardar en caché:', error);
    }
  };

  // Efecto para cargar datos iniciales (solo sales)
  useEffect(() => {
    if (isAdmin) {
      fetchInitialData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Efecto para cargar cursos cuando se cambia a la tab de cursos
  useEffect(() => {
    if (isAdmin && activeTab === 'cursos' && !coursesLoaded) {
      fetchCoursesData();
    }
  }, [isAdmin, activeTab, coursesLoaded]);

  const fetchSalesData = async (forceRefresh: boolean = false) => {
    // Intentar obtener del caché si no es refresh forzado
    if (!forceRefresh) {
      const cachedSales = getCachedData<CourseWithSales[]>(SALES_CACHE_KEY);
      if (cachedSales) {
        setSalesData(cachedSales);
        return;
      }
    }

    setIsLoadingSales(true);
    try {
      console.log('🌐 Obteniendo datos de ventas del backend...');
      console.log('Sales endpoint:', API_ENDPOINTS.sales.base);
      
      const sales = await authenticatedFetchJSON<CourseWithSales[]>(API_ENDPOINTS.sales.base);
      console.log('Sales data received:', sales);
      
      const salesData = sales || [];
      setSalesData(salesData);
      
      // Guardar en caché
      setCachedData(SALES_CACHE_KEY, salesData);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      setSalesData([]);
    } finally {
      setIsLoadingSales(false);
    }
  };

  const fetchCoursesData = async (forceRefresh: boolean = false) => {
    if (coursesLoaded && !forceRefresh) return; // Evitar cargas duplicadas
    
    // Intentar obtener del caché si no es refresh forzado
    if (!forceRefresh) {
      const cachedCourses = getCachedData<AdminCourse[]>(COURSES_CACHE_KEY);
      if (cachedCourses) {
        setAdminCourses(cachedCourses);
        setCoursesLoaded(true);
        return;
      }
    }

    setIsLoadingCourses(true);
    try {
      console.log('🌐 Obteniendo datos de cursos del backend...');
      console.log('Courses endpoint:', API_ENDPOINTS.administrator.courses);
      
      const courses = await authenticatedFetchJSON<AdminCourse[]>(API_ENDPOINTS.administrator.courses);
      console.log('Courses data received:', courses);
      
      // Enriquecer cada curso con información de estudiantes y lecciones
      // Usamos Promise.allSettled para que si alguna petición falla, continúe con las demás
      const enrichedCourses = await Promise.allSettled(
        (courses || []).map(async (course) => {
          let students_count = 0;
          let lessons_count = 0;
          
          try {
            const students = await authenticatedFetchJSON<Student[]>(
              API_ENDPOINTS.courses.students(course.external_reference.toString())
            );
            students_count = students?.length || 0;
          } catch (error) {
            console.error(`Error al obtener estudiantes del curso ${course.external_reference}:`, error);
          }
          
          try {
            const lessons = await authenticatedFetchJSON<Lesson[]>(
              API_ENDPOINTS.courses.lessons(course.external_reference.toString())
            );
            lessons_count = lessons?.length || 0;
          } catch (error) {
            console.error(`Error al obtener lecciones del curso ${course.external_reference}:`, error);
          }
          
          return {
            ...course,
            students_count,
            lessons_count,
          };
        })
      );
      
      // Filtrar solo las promesas cumplidas y extraer sus valores
      const successfulCourses = enrichedCourses
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<AdminCourse>).value);
      
      setAdminCourses(successfulCourses);
      setCoursesLoaded(true);
      
      // Guardar en caché
      setCachedData(COURSES_CACHE_KEY, successfulCourses);
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      // Incluso si falla la petición principal, intentamos mostrar los cursos básicos si existen
      setAdminCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    // Solo cargar ventas inicialmente para mostrar la página más rápido
    await fetchSalesData();

    setIsLoading(false);
  };

  // Función para calcular la liquidación (15 días después)
  const calculateLiquidationDate = (saleDate: string) => {
    const date = new Date(saleDate);
    date.setDate(date.getDate() + 15);
    const today = new Date();
    const daysRemaining = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      isPending: daysRemaining > 0,
    };
  };

  // Cálculos de estadísticas para administrador
  const calculateAdminStats = () => {
    // Sumar todos los totales de cada venta
    const totalIngresos = salesData.reduce((sum, course) => 
      sum + course.sales.reduce((salesSum, sale) => salesSum + sale.total, 0), 0
    );
    
    let totalLiquidado = 0;
    let totalPendiente = 0;

    salesData.forEach((course) => {
      course.sales.forEach((sale) => {
        const yourIncome = sale.total * 0.80; // 80% para el vendedor
        
        const liquidationInfo = calculateLiquidationDate(sale.date);
        if (liquidationInfo.isPending) {
          totalPendiente += yourIncome;
        } else {
          totalLiquidado += yourIncome;
        }
      });
    });

    return { totalIngresos, totalLiquidado, totalPendiente };
  };

  const stats = isAdmin ? calculateAdminStats() : { totalIngresos: 0, totalLiquidado: 0, totalPendiente: 0 };

  // Formatear fecha para gráfico
  const formatDateForChart = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Preparar datos para el gráfico por fecha con filtros
  const prepareSalesChartData = () => {
    // Usar la fecha actual como referencia
    const now = new Date();
    let cutoffDate = new Date(0);
    
    // Calcular fecha límite según el filtro de tiempo
    if (timeRange === '7') {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30') {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90') {
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 90);
    }

    const salesByDate: { [key: string]: { date: string, fullDate: string, amount: number, rawDate: Date } } = {};

    salesData.forEach((course) => {
      // Filtro por curso si está seleccionado
      if (courseFilter !== 'all' && course.external_reference.toString() !== courseFilter) {
        return;
      }

      course.sales.forEach((sale) => {
        const saleDate = new Date(sale.date);
        
        // Filtro por fecha
        if (saleDate < cutoffDate) {
          return;
        }

        const dateKey = saleDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const formattedDate = formatDateForChart(sale.date);
        const fullDate = saleDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const income = sale.total * 0.80;
        
        if (salesByDate[dateKey]) {
          salesByDate[dateKey].amount += income;
        } else {
          salesByDate[dateKey] = {
            date: formattedDate,
            fullDate: fullDate,
            amount: income,
            rawDate: saleDate
          };
        }
      });
    });

    // Convertir a array y ordenar por fecha
    return Object.values(salesByDate)
      .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
      .map(({ date, fullDate, amount }) => ({ date, fullDate, ventas: amount }));
  };

  const chartData = prepareSalesChartData();

  // Custom tooltip para mostrar fecha completa con año
  const CustomTooltip = ({ active, payload }: any ) => { 
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-900 font-montserrat mb-1">
            {payload[0].payload.fullDate}
          </p>
          <p className="text-sm text-gray-700 font-montserrat">
            Ventas: <span className="font-semibold text-studdeo-violet">
              ${payload[0].value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Formatear fecha completa para otros usos
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Obtener lista única de cursos para el filtro
  const uniqueCourses = salesData.map((course) => ({
    id: course.external_reference,
    name: course.name,
  }));

  if (!isAdmin) {
    // Vista para Teachers (por ahora mantener la original)
    return (
      <div className="flex h-screen bg-gray-50">
        <SideBar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <DashboardHeader user={user} />
            <div className="-mx-8">
              <hr className="mb-6 border-gray-300" />
            </div>
            <div className="text-center py-12">
              <p className="text-gray-600 font-montserrat text-lg">
                Dashboard para profesores en desarrollo
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <DashboardHeader user={user} />
          <div className="-mx-8">
            <hr className="mb-6 border-gray-300" />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-studdeo-violet rounded-full animate-spin"></div>
              <p className="text-gray-500 font-montserrat">Cargando datos...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-600 font-montserrat text-lg mb-4">{error}</p>
              <button
                onClick={fetchInitialData}
                className="px-4 py-2 bg-studdeo-violet text-white rounded-lg font-montserrat hover:bg-opacity-90"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* Stats Cards - Solo para Admin */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 font-montserrat mb-1">
                          Ingresos Totales
                        </p>
                        <p className="text-2xl font-bold text-gray-900 font-montserrat">
                          $ {stats.totalIngresos.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 font-montserrat mb-1">
                          Ya Liquidado
                        </p>
                        <p className="text-2xl font-bold text-green-600 font-montserrat">
                          $ {stats.totalLiquidado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 font-montserrat mb-1">
                          Pendiente de Liquidar
                        </p>
                        <p className="text-2xl font-bold text-orange-600 font-montserrat">
                          $ {stats.totalPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('graficos')}
                      className={`px-4 py-2 font-montserrat ${
                        activeTab === 'graficos'
                          ? 'text-gray-900 border-b-2 border-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      Gráficos de Ventas
                    </button>
                    <button
                      onClick={() => setActiveTab('cursos')}
                      className={`px-4 py-2 font-montserrat ${
                        activeTab === 'cursos'
                          ? 'text-gray-900 border-b-2 border-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      Cursos
                    </button>
                  </div>

                  {activeTab === 'graficos' ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-4">
                        Ventas en el Tiempo
                      </h3>
                      
                      {/* Filtros del gráfico */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                            Período de tiempo
                          </label>
                          <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as '7' | '30' | '90' | 'all')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md font-montserrat focus:outline-none focus:ring-2 focus:ring-studdeo-violet"
                          >
                            <option value="all">Todo el tiempo</option>
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 90 días</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                            Filtrar por curso
                          </label>
                          <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md font-montserrat focus:outline-none focus:ring-2 focus:ring-studdeo-violet"
                          >
                            <option value="all">Todos los cursos</option>
                            {uniqueCourses.map((course) => (
                              <option key={course.id} value={course.id.toString()}>
                                {course.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              sessionStorage.removeItem(SALES_CACHE_KEY);
                              fetchSalesData(true);
                            }}
                            disabled={isLoadingSales}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md font-montserrat hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isLoadingSales && (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {isLoadingSales ? 'Cargando...' : 'Actualizar datos'}
                          </button>
                        </div>
                      </div>

                      {chartData.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500 font-montserrat">No hay datos de ventas para el período seleccionado</p>
                        </div>
                      ) : (
                        <div className="w-full h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={chartData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                style={{ fontSize: '12px', fontFamily: 'Montserrat' }}
                              />
                              <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px', fontFamily: 'Montserrat' }}
                                tickFormatter={(value) => `$${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Line
                                type="monotone"
                                dataKey="ventas"
                                stroke="#7c3aed"
                                strokeWidth={2}
                                dot={{ fill: '#7c3aed', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 font-montserrat mb-4">
                        Todos los Cursos de la Aplicación
                      </h3>
                      {isLoadingCourses ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                          <div className="w-12 h-12 border-4 border-gray-200 border-t-studdeo-violet rounded-full animate-spin"></div>
                          <p className="text-gray-500 font-montserrat">Cargando cursos...</p>
                        </div>
                      ) : adminCourses.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500 font-montserrat">No hay cursos registrados</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {adminCourses.map((course) => (
                            <Card key={course.external_reference} className="border border-gray-200">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-studdeo-violet/10 flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-5 h-5 text-studdeo-violet" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 font-montserrat text-sm mb-1 truncate">
                                      {course.name}
                                    </h4>
                                    {course.description && (
                                      <p className="text-xs text-gray-600 font-montserrat line-clamp-2 mb-2">
                                        {course.description}
                                      </p>
                                    )}
                                    <div className="flex flex-col gap-2 mt-3">
                                      <div className="flex items-center gap-3 text-xs font-montserrat">
                                        <div className="flex items-center gap-1.5 text-studdeo-violet">
                                          <BookOpen className="h-3.5 w-3.5" />
                                          <span className="font-semibold">{course.lessons_count || 0}</span>
                                          <span className="text-gray-600">clases</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-studdeo-orange">
                                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                          </svg>
                                          <span className="font-semibold">{course.students_count || 0}</span>
                                          <span className="text-gray-600">estudiantes</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>ID: {course.product_id}</span>
                                        <span>•</span>
                                        <span>Fecha de creación: {formatDate(course.create_date)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
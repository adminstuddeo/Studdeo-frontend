import React, { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import SideBar from '../components/Dashboard/SideBar';
import { Card, CardContent } from '../components/ui/card';
import { authenticatedFetchJSON } from '../lib/api';
import { API_ENDPOINTS } from '../config/api';

// Constantes para el cache
const SALES_PAGE_CACHE_KEY = 'sales_page_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

interface TableRow {
  date: string;
  courseName: string;
  studentName: string;
  buyer: Buyer;
  totalAmount: number;
  mpCommission: number;
  commission: number;
  yourIncome: number;
  liquidation: {
    date: string;
    daysRemaining: number;
    isPending: boolean;
  };
  courseId: number;
}

const SalesPage: React.FC = () => {
  const [salesData, setSalesData] = useState<CourseWithSales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'todas' | 'liquidadas' | 'pendientes'>('todas');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [courseNameFilter, setCourseNameFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'custom' | 'all'>('all');
  const [customDateFrom, setCustomDateFrom] = useState<string>('');
  const [customDateTo, setCustomDateTo] = useState<string>('');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  // Funciones de cache
  const getCachedData = <T,>(key: string): T | null => {
    try {
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > CACHE_DURATION) {
        console.log('⏰ Caché expirado, limpiando...');
        sessionStorage.removeItem(key);
        return null;
      }

      console.log('✅ Usando datos del caché de ventas');
      return data as T;
    } catch (error) {
      console.error('Error al leer el caché:', error);
      return null;
    }
  };

  const setCachedData = <T,>(key: string, data: T): void => {
    try {
      const cacheObject = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(key, JSON.stringify(cacheObject));
      console.log('💾 Datos de ventas guardados en caché');
    } catch (error) {
      console.error('Error al guardar en caché:', error);
    }
  };

  const fetchSales = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Intentar obtener datos del cache si no es refresh forzado
      if (!forceRefresh) {
        const cachedData = getCachedData<CourseWithSales[]>(SALES_PAGE_CACHE_KEY);
        if (cachedData) {
          setSalesData(cachedData);
          setIsLoading(false);
          return;
        }
      }

      console.log('🔄 Obteniendo datos frescos de ventas del backend...');
      const data = await authenticatedFetchJSON<CourseWithSales[]>(API_ENDPOINTS.sales.base);
      console.log('Datos de ventas recibidos:', data);
      setSalesData(data || []);
      
      // Guardar en cache
      if (data) {
        setCachedData(SALES_PAGE_CACHE_KEY, data);
      }
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      console.error('Endpoint intentado:', API_ENDPOINTS.sales.base);
      setError('No se pudieron cargar las ventas. Por favor, intenta nuevamente.');
      setSalesData([]); // Set empty array on error to avoid crashes
    } finally {
      setIsLoading(false);
    }
  };

  // Función para limpiar cache y refrescar
  const handleRefreshData = () => {
    sessionStorage.removeItem(SALES_PAGE_CACHE_KEY);
    console.log('🗑️ Caché limpiado, actualizando datos...');
    fetchSales(true);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Función para calcular la liquidación (19 días después)
  const calculateLiquidationDate = (saleDate: string) => {
    const date = new Date(saleDate);
    date.setDate(date.getDate() + 19);
    const today = new Date();
    const daysRemaining = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      daysRemaining,
      isPending: daysRemaining > 0,
    };
  };

  // Cálculos de estadísticas
  const calculateStats = () => {
    let totalIngresos = 0;
    let totalLiquidado = 0;
    let totalPendiente = 0;

    salesData.forEach((course) => {
      course.sales.forEach((sale) => {
        const saleTotal = sale.total; // Usar el total del JSON que ya incluye descuentos
        const mpCommission = saleTotal * 0.043; // 4.3% comisión de Mercado Pago
        const afterMPCommission = saleTotal - mpCommission;
        const yourIncome = afterMPCommission * 0.80; // 80% para el vendedor después de comisión MP
        
        totalIngresos += yourIncome;
        
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

  const stats = calculateStats();

  // Función para normalizar texto (remover acentos y convertir a minúsculas)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Preparar datos para la tabla
  const tableData: TableRow[] = salesData.flatMap((course) =>
    course.sales.map((sale) => {
      const totalAmount = sale.total; // Usar el total del JSON
      const mpCommission = totalAmount * 0.043; // 4.3% comisión de Mercado Pago
      const afterMPCommission = totalAmount - mpCommission;
      const yourIncome = afterMPCommission * 0.80; // 80% para el vendedor después de comisión MP
      
      return {
        date: sale.date,
        courseName: course.name,
        studentName: sale.buyer.name,
        buyer: sale.buyer,
        totalAmount: totalAmount,
        mpCommission: mpCommission,
        commission: 80, // Porcentaje fijo del 80%
        yourIncome: yourIncome,
        liquidation: calculateLiquidationDate(sale.date),
        courseId: course.external_reference,
      };
    })
  );

  // Filtrar datos según tab, curso seleccionado, nombre y fechas
  const filteredData = tableData.filter((row) => {
    const matchesCourse = selectedCourse === 'all' || row.courseId.toString() === selectedCourse;
    
    // Buscar cada palabra del filtro por separado
    const normalizedCourseName = normalizeText(row.courseName);
    const searchWords = normalizeText(courseNameFilter).trim().split(/\s+/).filter(word => word.length > 0);
    const matchesCourseName = searchWords.length === 0 || searchWords.every(word => normalizedCourseName.includes(word));
    
    // Filtro de fechas mejorado
    let matchesDateRange = true;
    if (dateRange !== 'all') {
      const rowDate = new Date(row.date);
      const now = new Date();
      
      if (dateRange === 'custom') {
        // Rango personalizado
        if (customDateFrom) {
          const fromDate = new Date(customDateFrom);
          fromDate.setHours(0, 0, 0, 0);
          matchesDateRange = matchesDateRange && rowDate >= fromDate;
        }
        if (customDateTo) {
          const toDate = new Date(customDateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && rowDate <= toDate;
        }
      } else {
        // Rangos predefinidos
        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - daysAgo);
        cutoffDate.setHours(0, 0, 0, 0);
        matchesDateRange = rowDate >= cutoffDate;
      }
    }
    
    const matchesTab =
      activeTab === 'todas' ||
      (activeTab === 'liquidadas' && !row.liquidation.isPending) ||
      (activeTab === 'pendientes' && row.liquidation.isPending);
    
    return matchesCourse && matchesCourseName && matchesDateRange && matchesTab;
  });

  // Obtener lista única de cursos
  const uniqueCourses = salesData.map((course) => ({
    id: course.external_reference,
    name: course.name,
  }));

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-montserrat">
              Ventas y Liquidaciones
            </h1>
            <p className="text-gray-600 font-montserrat mt-2">
              Gestiona tus ventas y seguimiento de liquidaciones de Mercado Pago
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-studdeo-violet rounded-full animate-spin"></div>
              <p className="text-gray-500 font-montserrat">Cargando ventas...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-600 font-montserrat text-lg mb-4">{error}</p>
              <button
                onClick={() => fetchSales(true)}
                className="px-4 py-2 bg-studdeo-violet text-white rounded-lg font-montserrat hover:bg-opacity-90"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
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

              {/* Table Card */}
              <Card>
                <CardContent className="p-6">
                  {/* Tabs */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setActiveTab('todas')}
                        className={`px-4 py-2 font-montserrat ${
                          activeTab === 'todas'
                            ? 'text-gray-900 border-b-2 border-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        Todas
                      </button>
                      <button
                        onClick={() => setActiveTab('liquidadas')}
                        className={`px-4 py-2 font-montserrat ${
                          activeTab === 'liquidadas'
                            ? 'text-gray-900 border-b-2 border-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        Liquidadas
                      </button>
                      <button
                        onClick={() => setActiveTab('pendientes')}
                        className={`px-4 py-2 font-montserrat ${
                          activeTab === 'pendientes'
                            ? 'text-gray-900 border-b-2 border-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        Pendientes
                      </button>
                    </div>
                    
                    {/* Botón Actualizar datos */}
                    <button
                      onClick={handleRefreshData}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-studdeo-violet text-white rounded-md hover:bg-studdeo-violet-dark disabled:opacity-50 disabled:cursor-not-allowed font-montserrat"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Actualizar datos
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                        Buscar curso
                      </label>
                      <input
                        type="text"
                        value={courseNameFilter}
                        onChange={(e) => setCourseNameFilter(e.target.value)}
                        placeholder="Nombre del curso..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md font-montserrat focus:outline-none focus:ring-2 focus:ring-studdeo-violet"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                        Filtrar por curso
                      </label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                        Rango de fechas
                      </label>
                      <select
                        value={dateRange}
                        onChange={(e) => {
                          setDateRange(e.target.value as '7' | '30' | '90' | 'custom' | 'all');
                          if (e.target.value !== 'custom') {
                            setCustomDateFrom('');
                            setCustomDateTo('');
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md font-montserrat focus:outline-none focus:ring-2 focus:ring-studdeo-violet"
                      >
                        <option value="all">Todas las fechas</option>
                        <option value="7">Últimos 7 días</option>
                        <option value="30">Últimos 30 días</option>
                        <option value="90">Últimos 90 días</option>
                        <option value="custom">Rango personalizado...</option>
                      </select>
                    </div>
                  </div>

                  {/* Rango personalizado */}
                  {dateRange === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                          Fecha desde
                        </label>
                        <input
                          type="date"
                          value={customDateFrom}
                          onChange={(e) => setCustomDateFrom(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md font-montserrat focus:outline-none focus:ring-2 focus:ring-studdeo-violet"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 font-montserrat mb-2">
                          Fecha hasta
                        </label>
                        <input
                          type="date"
                          value={customDateTo}
                          onChange={(e) => setCustomDateTo(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md font-montserrat focus:outline-none focus:ring-2 focus:ring-studdeo-violet"
                        />
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  {filteredData.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 font-montserrat text-lg">
                        No hay ventas registradas
                      </p>
                      <p className="text-gray-400 font-montserrat text-sm mt-2">
                        Cuando realices ventas, aparecerán aquí
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-montserrat text-sm font-semibold text-gray-700">
                              Fecha
                            </th>
                            <th className="text-left py-3 px-4 font-montserrat text-sm font-semibold text-gray-700">
                              Curso
                            </th>
                            <th className="text-left py-3 px-4 font-montserrat text-sm font-semibold text-gray-700">
                              Estudiante
                            </th>
                            <th className="text-right py-3 px-4 font-montserrat text-sm font-semibold text-gray-700">
                              Monto Total
                            </th>
                            <th className="text-right py-3 px-4 font-montserrat text-sm font-semibold text-gray-700">
                              Comisión MP
                            </th>
                            <th className="text-right py-3 px-4 font-montserrat text-sm font-semibold text-gray-700">
                              Comisión
                            </th>
                            <th className="text-right py-3 px-4 font-montserrat text-sm font-semibold text-gray-700">
                              Tu Ingreso
                            </th>
                            <th className="text-center py-3 px-4 font-montserrat text-sm font-semibold text-gray-700">
                              Estado
                            </th>
                            <th className="text-left py-3 px-4 font-montserrat text-sm font-semibold text-gray-700">
                              Liquidación
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((row, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-montserrat text-sm text-gray-900">
                                {formatDate(row.date)}
                              </td>
                              <td className="py-3 px-4 font-montserrat text-sm text-gray-900">
                                {row.courseName}
                              </td>
                              <td className="py-3 px-4 font-montserrat text-sm text-gray-900">
                                <button
                                  onClick={() => {
                                    setSelectedBuyer(row.buyer);
                                    setIsBuyerModalOpen(true);
                                  }}
                                  className="text-studdeo-violet hover:underline cursor-pointer font-medium flex items-center gap-1"
                                >
                                  {row.studentName}
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </td>
                              <td className="py-3 px-4 font-montserrat text-sm text-gray-900 text-right">
                                $ {row.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4 font-montserrat text-sm text-red-600 text-right">
                                -$ {row.mpCommission.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4 font-montserrat text-sm text-gray-600 text-right">
                                {row.commission}%
                              </td>
                              <td className="py-3 px-4 font-montserrat text-sm text-green-600 text-right">
                                $ {row.yourIncome.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {row.liquidation.isPending ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 font-montserrat">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pendiente
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 font-montserrat">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Liquidado
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-montserrat text-sm text-gray-600">
                                {row.liquidation.date}
                                <br />
                                <span className="text-xs text-gray-500">
                                  {row.liquidation.isPending
                                    ? `En ${row.liquidation.daysRemaining} días`
                                    : 'Completado'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>

      {/* Modal de información del comprador */}
      {isBuyerModalOpen && selectedBuyer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsBuyerModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 font-montserrat">Información del Comprador</h3>
              <button
                onClick={() => setIsBuyerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 font-montserrat mb-1">
                  Nombre
                </label>
                <p className="text-base font-montserrat text-gray-900">{selectedBuyer.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 font-montserrat mb-1">
                  Email
                </label>
                <p className="text-base font-montserrat text-gray-900">{selectedBuyer.emai}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 font-montserrat mb-1">
                  Teléfono
                </label>
                <p className="text-base font-montserrat text-gray-900">{selectedBuyer.phone}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsBuyerModalOpen(false)}
                className="px-4 py-2 bg-studdeo-violet text-white rounded-lg font-montserrat hover:bg-opacity-90"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;

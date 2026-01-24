import React, { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import SideBar from '../components/Dashboard/SideBar';
import { Card, CardContent } from '../components/ui/card';
import { authenticatedFetchJSON } from '../lib/api';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

// Constantes para el cache compartido entre Dashboard y SalesPage
const SALES_CACHE_KEY = 'dashboard_sales_cache'; // Usar la misma clave que DashboardPage
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
  contract_discount: number;
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
  buyer: Buyer;
  totalAmount: number;
  discount: number;
  mpCommission: number;
  contractDiscount: number;
  yourIncome: number;
  liquidation: {
    date: string;
    daysRemaining: number;
    isPending: boolean;
  };
  courseId: number;
  saleId: number; // ID único de la venta para evitar duplicados
}

const SalesPage: React.FC = () => {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<CourseWithSales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'todas' | 'liquidadas' | 'pendientes'>('todas');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [courseNameFilter, setCourseNameFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'custom' | 'all'>('all');
  const [customDateFrom, setCustomDateFrom] = useState<string>('');
  const [customDateTo, setCustomDateTo] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<'date' | 'totalAmount' | 'discount' | 'mpCommission' | 'contractDiscount' | 'yourIncome' | 'liquidation' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const isAdmin = user?.role === 'administrator';

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
    
    // SIEMPRE limpiar caché para asegurar datos frescos
    sessionStorage.removeItem(SALES_CACHE_KEY);
    
    try {
      // Intentar obtener datos del cache si no es refresh forzado
      if (!forceRefresh) {
        const cachedData = getCachedData<CourseWithSales[]>(SALES_CACHE_KEY);
        if (cachedData) {
          setSalesData(cachedData);
          setIsLoading(false);
          return;
        }
      }

      console.log('🔄 Obteniendo datos frescos de ventas del backend...');
      const salesEndpoint = isAdmin 
        ? API_ENDPOINTS.administrator.sales 
        : API_ENDPOINTS.sales.base;
      const data = await authenticatedFetchJSON<CourseWithSales[]>(salesEndpoint);
      setSalesData(data || []);
      
      // Guardar en cache compartido
      if (data) {
        setCachedData(SALES_CACHE_KEY, data);
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
    sessionStorage.removeItem(SALES_CACHE_KEY);
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
      const totalAmount = sale.total; // Usar el total del JSON (ya incluye descuento aplicado)
      const mpCommission = totalAmount * 0.043; // 4.3% comisión de Mercado Pago
      const afterMPCommission = totalAmount - mpCommission;
      const yourIncome = afterMPCommission * sale.contract_discount; // Usar contract_discount del backend
      
      return {
        date: sale.date,
        courseName: course.name,
        buyer: sale.buyer,
        totalAmount: totalAmount,
        discount: sale.discount,
        mpCommission: mpCommission,
        contractDiscount: sale.contract_discount * 100, // Convertir a porcentaje
        yourIncome: yourIncome,
        liquidation: calculateLiquidationDate(sale.date),
        courseId: course.external_reference,
        saleId: sale.external_reference, // Añadir ID único de la venta
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

  // Cálculos de estadísticas sobre TODOS los datos (sin filtros)
  const calculateStats = () => {
    // Total general: suma de todos los sale.total de todos los cursos
    const totalIngresos = salesData.reduce(
      (sum, course) =>
        sum + course.sales.reduce((salesSum, sale) => salesSum + sale.total, 0),
      0,
    );

    let totalLiquidado = 0; // Ganancia real del profesor (liquidado)
    let totalPendiente = 0; // Ganancia real del profesor (pendiente)

    // Calcular liquidado/pendiente sobre todos los datos
    salesData.forEach((course) => {
      course.sales.forEach((sale) => {
        const mpCommission = sale.total * 0.043;
        const afterMPCommission = sale.total - mpCommission;
        const yourIncome = afterMPCommission * sale.contract_discount;
        
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

  // Función para manejar el ordenamiento
  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      // Si ya está ordenado por esta columna, cambiar dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nueva columna, ordenar descendente por defecto
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Aplicar ordenamiento a los datos filtrados
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'totalAmount':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      case 'discount':
        aValue = a.discount;
        bValue = b.discount;
        break;
      case 'mpCommission':
        aValue = a.mpCommission;
        bValue = b.mpCommission;
        break;
      case 'contractDiscount':
        aValue = a.contractDiscount;
        bValue = b.contractDiscount;
        break;
      case 'yourIncome':
        aValue = a.yourIncome;
        bValue = b.yourIncome;
        break;
      case 'liquidation':
        aValue = new Date(a.liquidation.date).getTime();
        bValue = new Date(b.liquidation.date).getTime();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Componente para el icono de ordenamiento
  const SortIcon: React.FC<{ column: typeof sortColumn }> = ({ column }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-studdeo-violet" />
      : <ArrowDown className="w-4 h-4 text-studdeo-violet" />;
  };

  // Obtener lista única de cursos
  const uniqueCourses = salesData.map((course) => ({
    id: course.external_reference,
    name: course.name,
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SideBar />
      <div className="flex-1 flex flex-col pt-16 lg:pt-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-montserrat">
              Ventas y Liquidaciones
            </h1>
            <p className="text-gray-600 font-montserrat mt-2 text-sm sm:text-base">
              Gestiona tus ventas y seguimiento de liquidaciones.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 font-montserrat mb-1">
                          Ingresos Totales
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-gray-900 font-montserrat truncate">
                          $ {stats.totalIngresos.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 font-montserrat mb-1">
                          Ya Liquidado
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-green-600 font-montserrat truncate">
                          $ {stats.totalLiquidado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 font-montserrat mb-1">
                          Pendiente de Liquidar
                        </p>
                        <p className="text-lg sm:text-2xl font-bold text-orange-600 font-montserrat truncate">
                          $ {stats.totalPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Table Card */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  {/* Tabs */}
                  <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                    <div className="flex gap-2 sm:gap-4 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab('todas')}
                        className={`px-3 sm:px-4 py-2 font-montserrat text-sm sm:text-base whitespace-nowrap ${
                          activeTab === 'todas'
                            ? 'text-gray-900 border-b-2 border-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        Todas
                      </button>
                      <button
                        onClick={() => setActiveTab('liquidadas')}
                        className={`px-3 sm:px-4 py-2 font-montserrat text-sm sm:text-base whitespace-nowrap ${
                          activeTab === 'liquidadas'
                            ? 'text-gray-900 border-b-2 border-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        Liquidadas
                      </button>
                      <button
                        onClick={() => setActiveTab('pendientes')}
                        className={`px-3 sm:px-4 py-2 font-montserrat text-sm sm:text-base whitespace-nowrap ${
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
                      className="flex items-center gap-2 px-4 py-2 bg-studdeo-violet text-white rounded-md hover:bg-studdeo-violet-dark disabled:opacity-50 disabled:cursor-not-allowed font-montserrat text-sm sm:text-base w-full sm:w-auto justify-center"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Actualizar datos
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                  {sortedData.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 font-montserrat text-lg">
                        No hay ventas registradas
                      </p>
                      <p className="text-gray-400 font-montserrat text-sm mt-2">
                        Cuando realices ventas, aparecerán aquí
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Vista Desktop - Tabla */}
                      <div className="hidden lg:block">
                        <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                          <div className="inline-block min-w-full align-middle">
                            <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th 
                                onClick={() => handleSort('date')}
                                className="text-left py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none"
                              >
                                <div className="flex items-center gap-1">
                                  Fecha
                                  <SortIcon column="date" />
                                </div>
                              </th>
                              <th className="text-left py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm font-semibold text-gray-700">
                                Curso
                              </th>
                              <th 
                                onClick={() => handleSort('totalAmount')}
                                className="text-right py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none"
                              >
                                <div className="flex items-center justify-end gap-1">
                                  Monto Total
                                  <SortIcon column="totalAmount" />
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('discount')}
                                className="text-right py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none"
                              >
                                <div className="flex items-center justify-end gap-1">
                                  Descuento
                                  <SortIcon column="discount" />
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('mpCommission')}
                                className="text-right py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none"
                              >
                                <div className="flex items-center justify-end gap-1">
                                  Comisión MP
                                  <SortIcon column="mpCommission" />
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('contractDiscount')}
                                className="text-right py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none"
                              >
                                <div className="flex items-center justify-end gap-1">
                                  % Contrato
                                  <SortIcon column="contractDiscount" />
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('yourIncome')}
                                className="text-right py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none"
                              >
                                <div className="flex items-center justify-end gap-1">
                                  Tu Ingreso
                                  <SortIcon column="yourIncome" />
                                </div>
                              </th>
                              <th className="text-center py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm font-semibold text-gray-700 whitespace-nowrap">
                                Estado
                              </th>
                              <th 
                                onClick={() => handleSort('liquidation')}
                                className="text-left py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer hover:bg-gray-50 select-none"
                              >
                                <div className="flex items-center gap-1">
                                  Liquidación
                                  <SortIcon column="liquidation" />
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedData.map((row, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm text-gray-900 whitespace-nowrap">
                                  {formatDate(row.date)}
                                </td>
                                <td className="py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm text-gray-900 max-w-xs truncate">
                                  {row.courseName}
                                </td>
                                <td className="py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm text-gray-900 text-right whitespace-nowrap">
                                  $ {row.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm text-right whitespace-nowrap">
                                  {row.discount !== 0 ? (
                                    <span className={row.discount < 0 ? "text-red-600" : "text-green-600"}>
                                      {row.discount < 0 ? '-' : '+'}$ {Math.abs(row.discount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm text-red-600 text-right whitespace-nowrap">
                                  -$ {row.mpCommission.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm text-gray-600 text-right whitespace-nowrap">
                                  {row.contractDiscount.toFixed(0)}%
                                </td>
                                <td className="py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm text-green-600 text-right whitespace-nowrap">
                                  $ {row.yourIncome.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-2 xl:px-4 text-center">
                                  {row.liquidation.isPending ? (
                                    <span className="inline-flex items-center px-2 xl:px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 font-montserrat whitespace-nowrap">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pendiente
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 xl:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 font-montserrat whitespace-nowrap">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Liquidado
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-2 xl:px-4 font-montserrat text-xs xl:text-sm text-gray-600 whitespace-nowrap">
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
                        </div>
                      </div>

                      {/* Vista Mobile - Cards */}
                      <div className="lg:hidden space-y-4">
                        {sortedData.map((row, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            {/* Header de la card */}
                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 font-montserrat mb-1">Fecha</p>
                                <p className="text-sm font-semibold text-gray-900 font-montserrat">{formatDate(row.date)}</p>
                              </div>
                              <div>
                                {row.liquidation.isPending ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 font-montserrat">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pendiente
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 font-montserrat">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Liquidado
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Curso */}
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 font-montserrat mb-1">Curso</p>
                              <p className="text-sm font-medium text-gray-900 font-montserrat">{row.courseName}</p>
                            </div>

                            {/* Montos */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <p className="text-xs text-gray-500 font-montserrat mb-1">Monto Total</p>
                                <p className="text-sm font-semibold text-gray-900 font-montserrat">
                                  $ {row.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-montserrat mb-1">Descuento</p>
                                {row.discount !== 0 ? (
                                  <p className={`text-sm font-semibold font-montserrat ${row.discount < 0 ? "text-red-600" : "text-green-600"}`}>
                                    {row.discount < 0 ? '-' : '+'}$ {Math.abs(row.discount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                ) : (
                                  <p className="text-sm font-semibold text-gray-400 font-montserrat">-</p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <p className="text-xs text-gray-500 font-montserrat mb-1">Comisión MP</p>
                                <p className="text-sm font-semibold text-red-600 font-montserrat">
                                  -$ {row.mpCommission.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-montserrat mb-1">% Contrato</p>
                                <p className="text-sm font-semibold text-gray-900 font-montserrat">{row.contractDiscount.toFixed(0)}%</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <p className="text-xs text-gray-500 font-montserrat mb-1">% Contrato</p>
                                <p className="text-sm font-semibold text-gray-900 font-montserrat">{row.contractDiscount.toFixed(0)}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-montserrat mb-1">Tu Ingreso</p>
                                <p className="text-sm font-semibold text-green-600 font-montserrat">
                                  $ {row.yourIncome.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>

                            {/* Liquidación */}
                            <div className="pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 font-montserrat mb-1">Liquidación</p>
                              <p className="text-sm font-medium text-gray-900 font-montserrat">{row.liquidation.date}</p>
                              <p className="text-xs text-gray-500 font-montserrat mt-1">
                                {row.liquidation.isPending
                                  ? `En ${row.liquidation.daysRemaining} días`
                                  : 'Completado'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SalesPage;

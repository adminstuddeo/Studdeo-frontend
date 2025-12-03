const MetricsPage = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Métricas Generales</h2>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-4">
          <div className="text-5xl">👨‍🎓</div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Total Estudiantes</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-4">
          <div className="text-5xl">👨‍🏫</div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Total Profesores</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-4">
          <div className="text-5xl">📚</div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Clases Activas</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-4">
          <div className="text-5xl">✅</div>
          <div>
            <h3 className="text-sm text-gray-500 font-medium">Asistencia Promedio</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">0%</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Gráfico de Asistencia</h3>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded text-gray-400">
            {/* TODO: Integrar librería de gráficos como Chart.js o Recharts */}
            <p>Aquí irá el gráfico de asistencia</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Rendimiento por Clase</h3>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded text-gray-400">
            {/* TODO: Integrar librería de gráficos */}
            <p>Aquí irá el gráfico de rendimiento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;

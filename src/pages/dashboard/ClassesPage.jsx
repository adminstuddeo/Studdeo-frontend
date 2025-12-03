const ClassesPage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Clases</h2>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold rounded-md hover:opacity-90 transition">
          + Nueva Clase
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Profesor</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Horario</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estudiantes</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                No hay clases registradas. Haz clic en "Nueva Clase" para agregar una.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassesPage;

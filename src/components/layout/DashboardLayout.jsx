import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Studdeo</h2>
        </div>
        
        <nav className="flex-1 py-4">
          <Link to="/dashboard" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition">
            <span className="text-xl mr-3">📊</span>
            Métricas
          </Link>
          <Link to="/dashboard/classes" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition">
            <span className="text-xl mr-3">📚</span>
            Clases
          </Link>
          <Link to="/dashboard/teachers" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition">
            <span className="text-xl mr-3">👨‍🏫</span>
            Profesores
          </Link>
          <Link to="/dashboard/students" className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition">
            <span className="text-xl mr-3">👨‍🎓</span>
            Estudiantes
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">{user?.name || user?.email}</span>
              <button 
                onClick={logout} 
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

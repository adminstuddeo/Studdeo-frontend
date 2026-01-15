import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Studdeo.png';
import { LayoutDashboard, BookOpen, BarChart3, DollarSign, LogOut } from 'lucide-react';

const SideBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Resumen', path: '/dashboard' },
    { icon: BookOpen, label: 'Cursos', path: '/cursos' },
    { icon: DollarSign, label: 'Ventas', path: '/ventas' },
  ];

  return (
    <div className="w-80 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <img src={logo} alt="Studdeo logo" className="w-30 h-20 object-contain" />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <a
                  href={item.path}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-montserrat"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-base">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Section */}
      {user && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-studdeo-violet flex items-center justify-center text-white font-bold text-lg font-montserrat">
              {user.name?.charAt(0) || ''}{user.lastname?.charAt(0) || ''}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 font-montserrat truncate">
                {user.name || ''} {user.lastname || ''}
              </p>
              <p className="text-xs text-gray-500 font-montserrat truncate">
                {user.email || ''}
              </p>
              <p className="text-xs text-gray-500 font-montserrat truncate">
                <strong>Rol:</strong> {user.role_name ? user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1) : 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-montserrat"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-base">Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SideBar;

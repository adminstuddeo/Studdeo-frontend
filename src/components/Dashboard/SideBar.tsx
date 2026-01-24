import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoExpanded from "../../assets/Studdeo.png";
import logo from "../../assets/Studdeo_paracaidas.png";
import { useAuth } from "../../contexts/AuthContext";

const SideBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Resumen", path: "/dashboard" },
    { icon: BookOpen, label: "Cursos", path: "/cursos" },
    { icon: DollarSign, label: "Ventas", path: "/ventas" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <img
          src={logoExpanded}
          alt="Studdeo logo"
          className="h-10 object-contain"
        />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40
        h-screen bg-white border-r border-gray-200 flex flex-col
        transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "w-80"}
      `}
      >
        {/* Desktop Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 z-50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        <div
          className={`p-4 border-b border-gray-200 hidden lg:flex ${isCollapsed ? "justify-center" : "justify-center"}`}
        >
          <img
            src={isCollapsed ? logo : logoExpanded}
            alt="Studdeo logo"
            className={`object-contain transition-all duration-300 ${isCollapsed ? "w-12 h-12" : "w-30 h-20"}`}
          />
        </div>

        {/* Menu Items */}
        <nav className={`flex-1 mt-16 lg:mt-0 ${isCollapsed ? "p-3" : "p-6"}`}>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <a
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-montserrat group relative ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span
                      className={`text-base transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}
                    >
                      {item.label}
                    </span>
                    {/* Tooltip para cuando está colapsado */}
                    {isCollapsed && (
                      <span className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {item.label}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info Section */}
        {user && (
          <div
            className={`border-t border-gray-200 ${isCollapsed ? "p-3" : "p-6"}`}
          >
            <div
              className={`flex items-center gap-3 mb-4 ${isCollapsed ? "flex-col" : ""}`}
            >
              <div className="w-12 h-12 rounded-full bg-studdeo-violet flex items-center justify-center text-white font-bold text-lg font-montserrat flex-shrink-0">
                {user.name?.charAt(0) || ""}
                {user.lastname?.charAt(0) || ""}
              </div>
              <div
                className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}
              >
                <p className="text-sm font-semibold text-gray-900 font-montserrat truncate">
                  {user.name || ""} {user.lastname || ""}
                </p>
                <p className="text-xs text-gray-500 font-montserrat truncate">
                  {user.email || ""}
                </p>
                <p className="text-xs text-gray-500 font-montserrat truncate">
                  <strong>Rol:</strong>{" "}
                  {user.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "N/A"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-montserrat group relative ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? "Cerrar Sesión" : ""}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span
                className={`text-base transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}
              >
                Cerrar Sesión
              </span>
              {/* Tooltip para cuando está colapsado */}
              {isCollapsed && (
                <span className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Cerrar Sesión
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 font-montserrat mb-2">
                Cerrar Sesión
              </h3>
              <p className="text-gray-600 font-montserrat">
                ¿Estás seguro de que deseas cerrar sesión?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-montserrat hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-montserrat hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;

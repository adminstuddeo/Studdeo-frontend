import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SideBar from '../components/Dashboard/SideBar';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import StatsCard from '../components/Dashboard/StatsCard';
import SalesChart from '../components/Dashboard/SalesChart';
import { DollarSign, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <DashboardHeader userName={user?.name + ' ' + user?.lastname || 'Usuario'} />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <StatsCard
              title="Ingresos Totales"
              value="$391,92"
              icon={DollarSign}
              iconBgColor="bg-green-50"
              iconColor="text-green-600"
            />
            <StatsCard
              title="Estudiantes"
              value="4"
              icon={Users}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
          </div>

          {/* Sales Chart */}
          <SalesChart />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
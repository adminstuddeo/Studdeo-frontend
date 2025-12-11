import React, { useState } from 'react';
import { Button } from '../ui/button';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../contexts/AuthContext';
import CreateUserModal from './CreateUserModal';

interface DashboardHeaderProps {
  user: User | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const { user: authUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdmin = authUser?.role?.toLowerCase() === 'administrator' || 
                  authUser?.role?.toLowerCase() === 'administrador' || 
                  authUser?.role?.toLowerCase() === 'admin';

  const handleCreateUser = (email: string, professors: unknown[]) => {
    console.log('Creating user:', { email, professors });
    // Aquí iría la lógica para crear el usuario
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-studdeo-violet font-league-spartan">
          Bienvenido, {user?.name} {user?.lastname}
        </h1>
        {isAdmin && (
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-studdeo-violet hover:bg-purple-700 text-white font-montserrat"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Crear Usuario
          </Button>
        )}
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </>
  );
};

export default DashboardHeader;

import { UserPlus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api";
import type { User } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import CreateUserModal from "./CreateUserModal";

interface ProfessorData {
  external_reference: number;
  name: string;
  lastname: string;
  email: string;
  active: boolean;
}

interface ContractDates {
  validFrom: string;
  validTo: string;
}

interface DashboardHeaderProps {
  user: User | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = user?.role === "administrator";

  // Genera contraseña segura (no se muestra en la UI)
  const generateSecurePassword = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const entropy = crypto.randomUUID() + Date.now().toString(36) + Math.random().toString(36);
    let pwd = upper[Math.floor(Math.random() * upper.length)];
    for (let i = 0; i < 7; i++) {
      const idx = (entropy.charCodeAt(i) * Date.now()) % chars.length;
      pwd += chars[idx];
    }
    return pwd.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleCreateUser = async (
    professorData: ProfessorData,
    percentage: number,
    contractDates: ContractDates,
  ) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      // Convertir las fechas a formato ISO con hora
      const validFrom = new Date(contractDates.validFrom).toISOString();
      const validTo = new Date(contractDates.validTo).toISOString();
      
      // Construir el body según el formato requerido por el backend
      const body = {
        name: professorData.name,
        lastname: professorData.lastname,
        email: professorData.email,
        role: 'teacher',
        password: generateSecurePassword(),
        contract: {
          percentaje: percentage / 100, // Convertir de 0-100 a 0-1
          valid_from: validFrom,
          valid_to: validTo
        }
      };

      console.log("Creando usuario con datos:", body);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.user.create}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error al crear el usuario");
      }

      await response.json();
      
      const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES');
      toast.success('Usuario creado exitosamente', {
        description: `Credenciales enviadas a ${professorData.email}. Comisión: ${percentage}%. Vigencia: ${formatDate(contractDates.validFrom)} - ${formatDate(contractDates.validTo)}`
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error('Error al crear usuario', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-studdeo-violet font-league-spartan">
          Bienvenido, {user?.name} {user?.lastname}
        </h1>
        {isAdmin && (
          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={isSubmitting}
            className="bg-studdeo-violet hover:bg-purple-700 text-white font-montserrat text-sm sm:text-base w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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

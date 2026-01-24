import { Search, X, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "../../config/api";
import { authenticatedFetchJSON } from "../../lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Professor {
  id: string;
  professorId: string;
  percentage: number;
}

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

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (professorData: ProfessorData, percentage: number, contractDates: ContractDates) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [professors, setProfessors] = useState<Professor[]>([
    { id: "1", professorId: "", percentage: 0 },
  ]);
  const [availableProfessors, setAvailableProfessors] = useState<
    ProfessorData[]
  >([]);
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(false);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [showDropdown, setShowDropdown] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fechas del contrato - por defecto hoy y sin fecha de fin
  const today = new Date().toLocaleDateString('en-CA');
  const [validFrom, setValidFrom] = useState(today);
  const [validTo, setValidTo] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProfessors();
      // Reset dates when opening modal
      setValidFrom(today);
      setValidTo('');
    }
  }, [isOpen]);

  const fetchProfessors = async () => {
    setIsLoadingProfessors(true);
    try {
      const data = await authenticatedFetchJSON<ProfessorData[]>(
        API_ENDPOINTS.profesores.alreadyMapped,
      );
      setAvailableProfessors(data);
    } catch (error) {
      console.error("Error al obtener profesores:", error);
      if (error instanceof Error && error.message.includes("Sesión expirada")) {
        // El usuario será redirigido automáticamente al login por ProtectedRoute
        window.location.reload();
      }
    } finally {
      setIsLoadingProfessors(false);
    }
  };

  if (!isOpen) return null;

  const handleProfessorChange = (
    id: string,
    field: "professorId" | "percentage",
    value: string | number,
  ) => {
    setProfessors(
      professors.map((prof) =>
        prof.id === id ? { ...prof, [field]: value } : prof,
      ),
    );
  };

  const handleSearchChange = (professorId: string, searchValue: string) => {
    setSearchTerms({ ...searchTerms, [professorId]: searchValue });
    setShowDropdown({ ...showDropdown, [professorId]: true });
  };

  const handleSelectProfessor = (
    professorId: string,
    selectedProf: ProfessorData,
  ) => {
    console.log("Seleccionando profesor:", professorId, selectedProf);
    handleProfessorChange(
      professorId,
      "professorId",
      selectedProf.external_reference.toString(),
    );
    setSearchTerms({ ...searchTerms, [professorId]: "" });
    setShowDropdown({ ...showDropdown, [professorId]: false });
  };

  const handleClearProfessor = (professorId: string) => {
    handleProfessorChange(professorId, "professorId", "");
    setSearchTerms({ ...searchTerms, [professorId]: "" });
  };

  const getFilteredProfessors = (professorId: string) => {
    const searchTerm = searchTerms[professorId]?.toLowerCase() || "";
    if (!searchTerm) return availableProfessors;

    return availableProfessors.filter(
      (prof) =>
        prof.name.toLowerCase().includes(searchTerm) ||
        prof.email.toLowerCase().includes(searchTerm),
    );
  };

  const getSelectedProfessor = (professorId: string) => {
    const selectedId = professors.find(
      (p) => p.id === professorId,
    )?.professorId;
    if (!selectedId) return null;
    return (
      availableProfessors.find(
        (p) => p.external_reference.toString() === selectedId,
      ) || null
    );
  };

  const handleSubmit = async () => {
    const professor = professors[0];
    if (!professor.professorId || !professor.percentage) {
      toast.error('Campos incompletos', {
        description: 'Por favor completa todos los campos requeridos'
      });
      return;
    }

    if (!validFrom || !validTo) {
      toast.error('Fechas requeridas', {
        description: 'Por favor selecciona las fechas del contrato'
      });
      return;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const fromDate = new Date(validFrom);

    if (validTo) {
      const toDate = new Date(validTo);

      if (toDate < currentDate) {
        toast.error('Fecha inválida', {
          description: 'La fecha de fin no puede ser anterior a la fecha actual'
        });
        return;
      }

      if (fromDate >= toDate) {
        toast.error('Fechas inválidas', {
          description: 'La fecha de inicio debe ser anterior a la fecha de fin'
        });
        return;
      }
    }

    const selectedProf = availableProfessors.find(
      (p) => p.external_reference.toString() === professor.professorId,
    );

    if (!selectedProf) {
      toast.error('Profesor no encontrado', {
        description: 'El profesor seleccionado no existe'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(selectedProf, parseFloat(professor.percentage.toString()), { validFrom, validTo });

      // Reset form
      setProfessors([{ id: "1", professorId: "", percentage: 0 }]);
      setValidFrom(today);
      setValidTo('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex-1 pr-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-montserrat">
              Crear Usuario
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-montserrat mt-1">
              Selecciona un profesor para crearle una cuenta de usuario con
              porcentaje de comisión
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Professors Section */}
        <div className="mb-6">
          <div className="mb-4">
            <Label className="text-gray-900 font-montserrat">
              Profesores Referentes
            </Label>
          </div>

          {isLoadingProfessors ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-studdeo-violet mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-montserrat">Cargando profesores...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {professors.map((professor) => (
                <div
                  key={professor.id}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end"
                >
                  <div>
                    <Label
                      htmlFor={`professor-${professor.id}`}
                      className="text-sm sm:text-base text-gray-900 font-montserrat mb-2"
                    >
                      Profesor
                    </Label>
                  <div className="space-y-2">
                    {getSelectedProfessor(professor.id) ? (
                      <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-md bg-gray-50">
                        <div className="flex-1">
                          <p className="font-montserrat text-sm font-medium">
                            {getSelectedProfessor(professor.id)!.name}
                          </p>
                          <p className="font-montserrat text-xs text-gray-500">
                            {getSelectedProfessor(professor.id)!.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleClearProfessor(professor.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        {isLoadingProfessors ? (
                          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-studdeo-violet w-4 h-4 z-10 animate-spin" />
                        ) : (
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                        )}
                        <Input
                          type="text"
                          placeholder={isLoadingProfessors ? "Cargando profesores..." : "Buscar por nombre o email..."}
                          value={searchTerms[professor.id] || ""}
                          onChange={(e) =>
                            handleSearchChange(professor.id, e.target.value)
                          }
                          onFocus={() =>
                            setShowDropdown({
                              ...showDropdown,
                              [professor.id]: true,
                            })
                          }
                          className="pl-10 font-montserrat"
                          readOnly={isLoadingProfessors}
                        />
                        {showDropdown[professor.id] &&
                          getFilteredProfessors(professor.id).length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              {getFilteredProfessors(professor.id).map(
                                (prof) => (
                                  <div
                                    key={prof.external_reference}
                                    onClick={() => {
                                      console.log("Click en profesor:", prof);
                                      handleSelectProfessor(professor.id, prof);
                                    }}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                                  >
                                    <p className="font-montserrat text-sm font-medium text-gray-900">
                                      {prof.name}
                                    </p>
                                    <p className="font-montserrat text-xs text-gray-500">
                                      {prof.email}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        {showDropdown[professor.id] &&
                          searchTerms[professor.id] &&
                          getFilteredProfessors(professor.id).length === 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-3">
                              <p className="font-montserrat text-sm text-gray-500">
                                No se encontraron profesores
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor={`percentage-${professor.id}`}
                    className="text-sm sm:text-base text-gray-900 font-montserrat mb-2"
                  >
                    Porcentaje (%)
                  </Label>
                  <Input
                    id={`percentage-${professor.id}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={professor.percentage || ""}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0 && value <= 100) {
                        handleProfessorChange(
                          professor.id,
                          "percentage",
                          value,
                        );
                      } else if (e.target.value === "") {
                        handleProfessorChange(professor.id, "percentage", 0);
                      }
                    }}
                    className="font-montserrat"
                  />
                </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contract Dates Section */}
        <div className="mb-6">
          <div className="mb-4">
            <Label className="text-gray-900 font-montserrat">
              Vigencia del Contrato
            </Label>
            <p className="text-sm text-gray-500 font-montserrat mt-1">
              Selecciona el período de vigencia o usa una duración rápida
            </p>
          </div>
          
          {/* Quick Duration Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                const start = new Date();
                const end = new Date(start);
                end.setMonth(end.getMonth() + 3);
                setValidFrom(start.toISOString().split('T')[0]);
                setValidTo(end.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-sm bg-studdeo-violet/10 hover:bg-studdeo-violet/20 text-studdeo-violet rounded-md font-montserrat transition-colors"
            >
              3 meses
            </button>
            <button
              type="button"
              onClick={() => {
                const start = new Date();
                const end = new Date(start);
                end.setMonth(end.getMonth() + 6);
                setValidFrom(start.toISOString().split('T')[0]);
                setValidTo(end.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-sm bg-studdeo-violet/10 hover:bg-studdeo-violet/20 text-studdeo-violet rounded-md font-montserrat transition-colors"
            >
              6 meses
            </button>
            <button
              type="button"
              onClick={() => {
                const start = new Date();
                const end = new Date(start);
                end.setFullYear(end.getFullYear() + 1);
                setValidFrom(start.toISOString().split('T')[0]);
                setValidTo(end.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-sm bg-studdeo-violet/10 hover:bg-studdeo-violet/20 text-studdeo-violet rounded-md font-montserrat transition-colors"
            >
              1 año
            </button>
            <button
              type="button"
              onClick={() => {
                const start = new Date();
                const end = new Date(start);
                end.setFullYear(end.getFullYear() + 2);
                setValidFrom(start.toISOString().split('T')[0]);
                setValidTo(end.toISOString().split('T')[0]);
              }}
              className="px-3 py-1.5 text-sm bg-studdeo-violet/10 hover:bg-studdeo-violet/20 text-studdeo-violet rounded-md font-montserrat transition-colors"
            >
              2 años
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validFrom" className="text-sm sm:text-base text-gray-900 font-montserrat mb-2">
                Fecha de Inicio
              </Label>
              <Input
                id="validFrom"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                min={today}
                className="font-montserrat"
              />
            </div>
            <div>
              <Label htmlFor="validTo" className="text-sm sm:text-base text-gray-900 font-montserrat mb-2">
                Fecha de Fin
              </Label>
              <Input
                id="validTo"
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                min={validFrom || today}
                className="font-montserrat"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="font-montserrat w-full sm:w-auto"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gray-600 hover:bg-gray-700 text-white font-montserrat w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Usuario'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;

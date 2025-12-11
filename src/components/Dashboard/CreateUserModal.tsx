import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface Professor {
  id: string;
  professorId: string;
  percentage: number;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, professors: Professor[]) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [professors, setProfessors] = useState<Professor[]>([
    { id: '1', professorId: '', percentage: 0 },
    { id: '2', professorId: '', percentage: 0 },
  ]);

  if (!isOpen) return null;

  const handleAddProfessor = () => {
    setProfessors([...professors, { id: Date.now().toString(), professorId: '', percentage: 0 }]);
  };

  const handleRemoveProfessor = (id: string) => {
    if (professors.length > 1) {
      setProfessors(professors.filter((prof) => prof.id !== id));
    }
  };

  const handleProfessorChange = (id: string, field: 'professorId' | 'percentage', value: string | number) => {
    setProfessors(professors.map((prof) => 
      prof.id === id ? { ...prof, [field]: value } : prof
    ));
  };

  const handleSubmit = () => {
    onSubmit(email, professors);
    // Reset form
    setEmail('');
    setProfessors([
      { id: '1', professorId: '', percentage: 0 },
      { id: '2', professorId: '', percentage: 0 },
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Crear Usuario</h2>
            <p className="text-sm text-gray-500 font-montserrat mt-1">
              Asigna profesores referentes al usuario con sus respectivos porcentajes de comisión
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Email Field */}
        <div className="mb-6">
          <Label htmlFor="user-email" className="text-gray-900 font-montserrat mb-2">
            Email del Usuario
          </Label>
          <Input
            id="user-email"
            type="email"
            placeholder="usuario@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="font-montserrat"
          />
        </div>

        {/* Professors Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-gray-900 font-montserrat">Profesores Referentes</Label>
            <Button
              type="button"
              onClick={handleAddProfessor}
              variant="outline"
              className="text-studdeo-violet border-studdeo-violet hover:bg-purple-50 font-montserrat"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Profesor
            </Button>
          </div>

          <div className="space-y-4">
            {professors.map((professor) => (
              <div key={professor.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-6">
                  <Label htmlFor={`professor-${professor.id}`} className="text-gray-900 font-montserrat mb-2">
                    Profesor
                  </Label>
                  <select
                    id={`professor-${professor.id}`}
                    value={professor.professorId}
                    onChange={(e) => handleProfessorChange(professor.id, 'professorId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-montserrat focus:outline-none focus:ring-2 focus:ring-studdeo-violet"
                  >
                    <option value="">Seleccionar profesor...</option>
                    <option value="prof1">Profesor 1</option>
                    <option value="prof2">Profesor 2</option>
                    <option value="prof3">Profesor 3</option>
                  </select>
                </div>

                <div className="col-span-5">
                  <Label htmlFor={`percentage-${professor.id}`} className="text-gray-900 font-montserrat mb-2">
                    Porcentaje (%)
                  </Label>
                  <Input
                    id={`percentage-${professor.id}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={professor.percentage || ''}
                    onChange={(e) => handleProfessorChange(professor.id, 'percentage', Number(e.target.value))}
                    className="font-montserrat"
                  />
                </div>

                <div className="col-span-1 flex items-center justify-center pb-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveProfessor(professor.id)}
                    disabled={professors.length === 1}
                    className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="font-montserrat"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-gray-600 hover:bg-gray-700 text-white font-montserrat"
          >
            Crear Usuario
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;

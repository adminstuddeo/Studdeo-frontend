import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import logo from '../assets/Studdeo.png';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implementar la llamada al endpoint de recuperación de contraseña
      // const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      // Simulación temporal
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
    } catch (err) {
      setError('Error al enviar el correo de recuperación. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-studdeo-violet to-purple-800 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white">
        <CardHeader className="text-center pt-6 pb-4">
          <div className="mx-auto ml-[6.1rem]">
            <img src={logo} alt="Studdeo logo and name" className="w-40 h-auto mb-4" />
          </div>
          <CardDescription className="text-2xl text-studdeo-violet font-montserrat font-bold">
            Recuperar Contraseña
          </CardDescription>
          <p className="text-sm text-gray-600 mt-2 font-montserrat">
            {success 
              ? 'Te hemos enviado las instrucciones' 
              : 'Ingresa tu correo electrónico y te enviaremos las instrucciones'}
          </p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-800 font-montserrat">
                    Correo enviado exitosamente
                  </p>
                </div>
                <p className="text-sm text-green-700 font-montserrat">
                  Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones para restablecer tu contraseña.
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700 font-montserrat">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full bg-studdeo-yellow text-studdeo-violet hover:bg-yellow-500 font-bold font-montserrat py-2 h-auto"
              >
                Volver al inicio de sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-studdeo-violet font-montserrat">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`font-montserrat border-gray-300 focus:border-studdeo-violet focus:ring-studdeo-violet ${error ? 'border-red-500' : ''}`}
                />
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-2">
                    <p className="text-sm text-red-600 font-montserrat">{error}</p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-studdeo-yellow text-studdeo-violet hover:bg-yellow-500 font-bold font-montserrat py-2 h-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-sm text-studdeo-violet font-montserrat hover:underline mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;

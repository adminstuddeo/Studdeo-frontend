import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import logo from '../assets/Studdeo.png';

const LoginCard: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      if (error instanceof Error) {
        let translated = error.message;
        if (translated === 'Wrong password.') {
          translated = 'Contraseña incorrecta.';
        } else if (translated === 'User not found.') {
          translated = 'Usuario no encontrado.';
        }
        setError(translated);
      } else {
        setError('Error al iniciar sesión. Por favor verifica tus credenciales.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white">
      <CardHeader className="text-center pt-6 pb-4">
        <img src={logo} alt="Studdeo logo and name" className="mx-auto w-40 h-auto mb-4" />
        <CardDescription className="text-2xl text-studdeo-violet font-montserrat font-bold">
          Bienvenido
        </CardDescription>
        <p className="text-sm text-gray-600 mt-2 font-montserrat">
          Ingresa tus credenciales para continuar
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-studdeo-violet font-montserrat">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="•••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`font-montserrat border-gray-300 focus:border-studdeo-violet focus:ring-studdeo-violet ${error ? 'border-red-500' : ''}`}
            />
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-2">
                <p className="text-sm text-red-600 font-montserrat">{error}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-studdeo-violet"
            />
            <label htmlFor="remember" className="text-sm text-gray-600 font-montserrat cursor-pointer">
              Recuérdame
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-studdeo-yellow text-studdeo-violet hover:bg-yellow-500 font-bold font-montserrat py-2 h-auto"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600 font-montserrat">
          <p>
            ¿Olvidaste tu contraseña?{' '}
            <a href="#" className="text-studdeo-violet font-bold hover:underline">
              Recuperar
            </a>
          </p>
        </div>
        

      </CardContent>
    </Card>
  );
};

export default LoginCard;
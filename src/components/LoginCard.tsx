import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

const LoginCard: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white">
      <CardHeader className="text-center pt-8 pb-6">
        <CardTitle className="text-4xl font-bold text-studdeo-violet font-league-spartan mb-2">
          Studdeo
        </CardTitle>
        <CardDescription className="text-base text-studdeo-violet font-montserrat">
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
              className="font-montserrat border-gray-300 focus:border-studdeo-violet focus:ring-studdeo-violet"
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
              className="font-montserrat border-gray-300 focus:border-studdeo-violet focus:ring-studdeo-violet"
            />
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
              ¿Olvidaste tu contraseña?
            </a>
          </p>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600 font-montserrat">
          <p>
            ¿No tienes cuenta?{' '}
            <a href="#" className="text-studdeo-violet font-bold hover:underline">
              Regístrate aquí
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginCard;
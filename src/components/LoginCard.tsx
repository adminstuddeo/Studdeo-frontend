import React, { useState, useEffect } from 'react';
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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const savedEmail = localStorage.getItem('login_email');
    const savedPassword = localStorage.getItem('login_password');
    const savedAttempts = localStorage.getItem('failed_attempts');
    const savedLockout = localStorage.getItem('lockout_time');
    
    if (savedEmail) {
      setEmail(savedEmail);
      console.log('Loaded email from localStorage');
    }
    if (savedPassword) {
      setPassword(savedPassword);
      console.log('Loaded password from localStorage');
    }
    if (savedAttempts) {
      setFailedAttempts(parseInt(savedAttempts));
    }
    if (savedLockout) {
      const lockoutTimestamp = parseInt(savedLockout);
      const now = Date.now();
      const timeRemaining = lockoutTimestamp - now;
      
      if (timeRemaining > 0) {
        setLockoutTime(lockoutTimestamp);
        setRemainingTime(Math.ceil(timeRemaining / 1000));
      } else {
        // El bloqueo ya expiró
        localStorage.removeItem('lockout_time');
        localStorage.removeItem('failed_attempts');
      }
    }
  }, []);

  // Timer para el bloqueo
  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const timeRemaining = Math.ceil((lockoutTime - now) / 1000);
        
        if (timeRemaining <= 0) {
          setLockoutTime(null);
          setFailedAttempts(0);
          setRemainingTime(0);
          localStorage.removeItem('lockout_time');
          localStorage.removeItem('failed_attempts');
          setError(null);
        } else {
          setRemainingTime(timeRemaining);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar si está bloqueado
    if (lockoutTime && Date.now() < lockoutTime) {
      const seconds = Math.ceil((lockoutTime - Date.now()) / 1000);
      setError(`Demasiados intentos fallidos. Espera ${seconds} segundos antes de intentar nuevamente.`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password, rememberMe);
      console.log('rememberMe:', rememberMe);
      
      // Login exitoso - limpiar intentos fallidos
      setFailedAttempts(0);
      localStorage.removeItem('failed_attempts');
      localStorage.removeItem('lockout_time');
      
      if (rememberMe) {
        localStorage.setItem('login_email', email);
        localStorage.setItem('login_password', password);
        console.log('Credentials saved to localStorage');
      } else {
        localStorage.removeItem('login_email');
        localStorage.removeItem('login_password');
        console.log('Credentials removed from localStorage');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
      
      // Incrementar intentos fallidos
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('failed_attempts', newAttempts.toString());
      
      // Si alcanza 5 intentos, bloquear por 1 minuto
      if (newAttempts >= 5) {
        const lockTime = Date.now() + 60000; // 1 minuto
        setLockoutTime(lockTime);
        setRemainingTime(60);
        localStorage.setItem('lockout_time', lockTime.toString());
        setError('Demasiados intentos fallidos. Debes esperar 1 minuto antes de intentar nuevamente.');
      } else {
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
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white">
      <CardHeader className="text-center pt-6 pb-4">
        <div className="mx-auto ml-[6.1rem]">
          <img src={logo} alt="Studdeo logo and name" className="w-40 h-auto mb-4" />
        </div>
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
              disabled={lockoutTime !== null && Date.now() < lockoutTime}
              className={`font-montserrat border-gray-300 focus:border-studdeo-violet focus:ring-studdeo-violet ${error ? 'border-red-500' : ''}`}
            />
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-2">
                <p className="text-sm text-red-600 font-montserrat">{error}</p>
                {lockoutTime && remainingTime > 0 && (
                  <p className="text-sm text-red-600 font-montserrat mt-1">
                    Tiempo restante: {remainingTime} segundo{remainingTime !== 1 ? 's' : ''}
                  </p>
                )}
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
            disabled={isLoading || (lockoutTime !== null && Date.now() < lockoutTime)}
          >
            {isLoading ? 'Iniciando sesión...' : 
             (lockoutTime && remainingTime > 0) ? `Bloqueado (${remainingTime}s)` : 
             'Iniciar Sesión'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-600 font-montserrat">
          <p>
            ¿Olvidaste tu contraseña?{' '}
            <a href="/forgot-password" className="text-studdeo-violet font-bold hover:underline">
              Recuperar
            </a>
          </p>
        </div>
        

      </CardContent>
    </Card>
  );
};

export default LoginCard;
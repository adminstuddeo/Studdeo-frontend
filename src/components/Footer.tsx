import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-studdeo-violet text-white font-montserrat">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-studdeo-yellow mb-4">Acerca de</h3>
            <p className="text-sm text-gray-200">
              Plataforma educativa diseñada para conectar estudiantes con profesores expertos.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-studdeo-yellow mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-200 hover:text-studdeo-yellow transition-colors">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-studdeo-yellow transition-colors">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-studdeo-yellow transition-colors">
                  Ayuda y soporte
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-studdeo-yellow mb-4">Contacto</h3>
            <p className="text-sm text-gray-200 mb-4">info@ejemplo.com</p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-studdeo-yellow text-studdeo-violet rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                <span className="text-lg">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-studdeo-yellow text-studdeo-violet rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                <span className="text-lg">𝕏</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-purple-700 pt-6 text-center text-sm text-gray-300">
          <p>© 2025 Studdeo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
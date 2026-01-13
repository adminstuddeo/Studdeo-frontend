import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-studdeo-violet hover:text-purple-800 mb-8 font-montserrat font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-4xl font-bold text-studdeo-violet font-montserrat mb-8">
          Política de Privacidad
        </h1>

        <div className="bg-white rounded-lg shadow-sm border-2 border-studdeo-violet/20 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              1. Información General
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Studdeo respeta tu privacidad. Esta plataforma funciona como intermediario educativo sin 
              almacenar datos personales en servidores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              2. Autenticación
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              La sesión se gestiona mediante tokens temporales almacenados localmente en tu navegador. 
              No utilizamos cookies de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              3. Pagos
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Los pagos son procesados por Mercado Pago. No tenemos acceso a información de tarjetas 
              o medios de pago.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              4. Seguridad
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Las comunicaciones están protegidas mediante protocolos de seguridad estándar (HTTPS).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              5. Modificaciones
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Esta política puede actualizarse. El uso continuado de la plataforma constituye 
              la aceptación de cualquier cambio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              6. Contacto
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Para consultas: soporte@studdeo.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPage;

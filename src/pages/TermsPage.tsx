import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

const TermsPage: React.FC = () => {
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
          Términos y Condiciones
        </h1>

        <div className="bg-white rounded-lg shadow-sm border-2 border-studdeo-violet/20 p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Al acceder y utilizar la plataforma Studdeo, aceptas cumplir con estos términos y condiciones. 
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              2. Uso de la Plataforma
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Studdeo es una plataforma educativa que conecta estudiantes con profesores. Los usuarios deben 
              utilizar la plataforma de manera responsable y respetuosa, cumpliendo con todas las leyes aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              3. Registro y Cuenta
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Para acceder a ciertos servicios, deberás crear una cuenta proporcionando información precisa y 
              actualizada. Eres responsable de mantener la confidencialidad de tus credenciales de acceso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              4. Contenido del Usuario
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Los usuarios son responsables del contenido que publican en la plataforma. Studdeo se reserva el 
              derecho de eliminar cualquier contenido que viole estos términos o las leyes aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              5. Pagos y Reembolsos
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Los pagos se procesan de forma segura a través de Mercado Pago. Las políticas de reembolso se 
              aplicarán según lo establecido para cada curso o servicio específico.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              6. Modificaciones
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Studdeo se reserva el derecho de modificar estos términos en cualquier momento. Los usuarios serán 
              notificados de cambios significativos a través de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-studdeo-violet font-montserrat mb-4">
              7. Contacto
            </h2>
            <p className="text-gray-700 font-montserrat leading-relaxed">
              Para cualquier consulta sobre estos términos, puedes contactarnos en soporte@studdeo.com
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsPage;

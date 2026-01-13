import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, HelpCircle } from 'lucide-react';
import Footer from '../components/Footer';

const SupportPage: React.FC = () => {
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

        <h1 className="text-4xl font-bold text-studdeo-violet font-montserrat mb-4">
          Ayuda y Soporte
        </h1>
        <p className="text-gray-600 font-montserrat mb-8">
          Estamos aquí para ayudarte. Encuentra respuestas a preguntas frecuentes o contáctanos directamente.
        </p>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border-2 border-studdeo-violet/20 p-6 hover:border-studdeo-violet/40 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-studdeo-violet/10 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-studdeo-violet" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-studdeo-violet font-montserrat">Email</h3>
                <p className="text-sm text-gray-600 font-montserrat">Respuesta en 24-48 horas</p>
              </div>
            </div>
            <a 
              href="mailto:soporte@studdeo.com"
              className="text-studdeo-violet hover:text-purple-800 font-montserrat font-semibold"
            >
              soporte@studdeo.com
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm border-2 border-studdeo-yellow/30 p-6 hover:border-studdeo-yellow transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-studdeo-yellow/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-studdeo-yellow" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-studdeo-violet font-montserrat">WhatsApp</h3>
                <p className="text-sm text-gray-600 font-montserrat">Respuesta inmediata</p>
              </div>
            </div>
            <a 
              href="https://api.whatsapp.com/send/?phone=5493515592131&text=Hola%21+Necesito+ayuda+con+Studdeo&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-studdeo-violet hover:text-purple-800 font-montserrat font-semibold"
            >
              +54 9 351 559-2131
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-studdeo-violet/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-studdeo-violet" />
            <h2 className="text-2xl font-bold text-studdeo-violet font-montserrat">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-studdeo-violet font-montserrat mb-2">
                ¿Cómo accedo a mis cursos?
              </h3>
              <p className="text-gray-700 font-montserrat leading-relaxed">
                Una vez que inicies sesión en tu cuenta, dirígete a la sección "Mis Cursos" en el menú principal. 
                Allí encontrarás todos los cursos en los que estás inscrito.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-studdeo-violet font-montserrat mb-2">
                ¿Cómo realizo un pago?
              </h3>
              <p className="text-gray-700 font-montserrat leading-relaxed">
                Los pagos se procesan de forma segura a través de Mercado Pago. Puedes pagar con tarjeta de crédito, 
                débito o efectivo en puntos de pago habilitados.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-studdeo-violet font-montserrat mb-2">
                ¿Cómo contacto con mi profesor?
              </h3>
              <p className="text-gray-700 font-montserrat leading-relaxed">
                Dentro de cada curso encontrarás una sección de mensajería donde podrás comunicarte directamente 
                con el profesor y hacer preguntas sobre el contenido.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-studdeo-violet font-montserrat mb-2">
                ¿Por cuánto tiempo tengo acceso a un curso?
              </h3>
              <p className="text-gray-700 font-montserrat leading-relaxed">
                Una vez que compras un curso, tienes acceso ilimitado de por vida al contenido, incluyendo 
                todas las actualizaciones futuras que realice el profesor.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportPage;

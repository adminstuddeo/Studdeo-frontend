import React from 'react';
import LoginCard from '../components/LoginCard';
import Footer from '../components/Footer';
import WaveDivider from '../components/ui/WaveDivider';

const LoginPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-white font-montserrat overflow-x-hidden">
      <div className="flex items-center justify-center px-4 py-8 relative z-20 mb-0 pb-0">
        <div className="w-full max-w-md">
          <LoginCard />
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="relative z-10 -mt-36 flex flex-col">
        <WaveDivider />
        <Footer />
      </div>
    </div>
  );
};

export default LoginPage;
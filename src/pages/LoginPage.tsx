import React from 'react';
import LoginCard from '../components/LoginCard';
import Footer from '../components/Footer';
import WaveDivider from '../components/WaveDivider';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-montserrat">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <LoginCard />
        </div>
      </div>
      <WaveDivider />
      <Footer />
    </div>
  );
};

export default LoginPage;
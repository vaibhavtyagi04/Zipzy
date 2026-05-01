import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, illustrationSrc }) => {
  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 md:p-10 font-outfit">
      <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden max-w-[1200px] w-full flex flex-col md:flex-row min-h-[700px]">
        {/* Left Side: Form */}
        <div className="flex-1 p-10 md:p-20 flex flex-col justify-center">
          {children}
        </div>

        {/* Right Side: Illustration */}
        <div className="flex-1 relative hidden md:block overflow-hidden p-4">
          <div className="w-full h-full rounded-[32px] overflow-hidden relative">
            <img 
              src={illustrationSrc} 
              alt="Auth Illustration" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            
            {/* Overlay Text */}
            <div className="absolute bottom-12 left-12 right-12">
              <h2 className="text-white text-3xl font-black mb-2 opacity-90">Zipzy Wallet</h2>
              <p className="text-white/80 text-sm font-medium leading-relaxed max-w-xs">
                Your journey into the decentralized world starts here. Secure, simple, and powerful.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key, ChevronLeft, Lock, Loader2, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';
import AuthLayout from '../components/AuthLayout';
import { useWalletStore } from '../store/walletStore';

const ImportWallet = () => {
  const navigate = useNavigate();
  const { setVault, addNotification } = useWalletStore();
  
  const [step, setStep] = useState(1);
  const [phrase, setPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePhrase = () => {
    setIsLoading(true);
    setError("");
    
    setTimeout(() => {
      try {
        const cleanedPhrase = phrase.trim().toLowerCase().replace(/\s+/g, ' ');
        const wordCount = cleanedPhrase.split(' ').length;
        
        if (wordCount !== 12 && wordCount !== 24) {
          throw new Error("Phrase must be 12 or 24 words");
        }

        // Validate with ethers
        ethers.Mnemonic.fromPhrase(cleanedPhrase);
        setStep(2);
      } catch (err) {
        setError(err.message || "Invalid seed phrase. Please check for typos.");
        addNotification("Invalid seed phrase", "error");
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const finalizeImport = () => {
    if (password.length < 8) {
      addNotification("Password must be at least 8 characters", "error");
      return;
    }
    if (password !== confirmPassword) {
      addNotification("Passwords do not match", "error");
      return;
    }

    setVault({ address: "0x" + Math.random().toString(16).slice(2, 42) }); // Mock address
    addNotification("Wallet imported successfully!", "success");
    navigate("/dashboard");
  };

  return (
    <AuthLayout illustrationSrc="/auth-illustration.png">
      <div className="max-w-md w-full mx-auto">
        <button 
          onClick={() => step > 1 ? setStep(1) : navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-black text-[#999] hover:text-[#111] transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step === 1 && (
          <div className="space-y-8">
            <div className="w-20 h-20 bg-[#9d4edd]/10 rounded-3xl flex items-center justify-center text-[#9d4edd] mb-10">
              <Key size={40} />
            </div>
            <div>
              <h1 className="text-[36px] font-black text-[#111] leading-tight mb-4">Import Wallet</h1>
              <p className="text-[#666] text-lg font-medium leading-relaxed">
                Enter your 12 or 24-word Secret Recovery Phrase to restore your wallet.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="Enter your seed phrase here..."
                className="w-full h-40 bg-[#f8f9fa] border border-[#eee] rounded-[24px] p-6 outline-none focus:border-[#9d4edd]/30 transition-all font-medium text-[#111] placeholder:text-[#999] resize-none"
              />
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl border border-red-100">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>

            <button
              disabled={!phrase.trim() || isLoading}
              onClick={validatePhrase}
              className="w-full h-16 bg-[#111] text-white rounded-[20px] font-black text-lg transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Verify Phrase"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 mb-10">
              <Lock size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#111] mb-2">Set a password</h2>
              <p className="text-[#666] font-medium">Create a password to secure this wallet on this device.</p>
            </div>

            <div className="space-y-4">
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                className="w-full h-16 bg-[#f8f9fa] border border-[#eee] rounded-[20px] px-8 outline-none focus:border-[#9d4edd]/30 transition-all font-medium text-[#111]"
              />
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full h-16 bg-[#f8f9fa] border border-[#eee] rounded-[20px] px-8 outline-none focus:border-[#9d4edd]/30 transition-all font-medium text-[#111]"
              />
            </div>

            <button
              onClick={finalizeImport}
              className="w-full h-16 bg-[#9d4edd] hover:bg-[#7b2cbf] text-white rounded-[20px] font-black text-lg transition-all shadow-xl shadow-[#9d4edd]/20 active:scale-[0.98]"
            >
              Restore Wallet
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ImportWallet;

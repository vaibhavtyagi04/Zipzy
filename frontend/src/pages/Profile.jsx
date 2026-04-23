// pages/Profile.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Key, Bell, HelpCircle, LogOut, Camera, Mail, User, Info, X } from "lucide-react";
import Avatar from "../components/Avatar";
import ThreeDLogo from "../components/ThreeDLogo";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useWalletStore } from "../store/walletStore";

export default function Profile() {
  const { user, updateUser, addNotification } = useWalletStore();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(user.avatar);

  const avatars = ["Zipzy", "Cyber", "Luxe", "Phantom", "Neon", "Future", "Digital", "Smart", "Chain", "Global"];

  const handleSave = () => {
    updateUser({ ...user, avatar: tempAvatar });
    addNotification("Profile updated successfully!", "success");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Left: Avatar & ID */}
        <div className="md:w-1/3 space-y-6">
          <Card className="text-center p-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-[#E9B3A2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-[40px] p-1 bg-gradient-to-r from-[#E9B3A2] to-[#AB9FF2] rotate-3 hover:rotate-0 transition-transform">
                <div className="w-full h-full rounded-[38px] overflow-hidden bg-theme p-2">
                  <Avatar seed={tempAvatar} />
                </div>
              </div>
              <button 
                onClick={() => setIsPickerOpen(true)}
                className="absolute -bottom-2 -right-2 p-3 bg-[#E9B3A2] rounded-2xl border-4 border-[#121212] text-[#121212] hover:scale-110 active:scale-95 transition-all shadow-xl z-20"
              >
                <Camera size={18} strokeWidth={3} />
              </button>
            </div>

            <h2 className="mt-8 text-2xl font-black text-theme tracking-tight">{user.name}</h2>
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mt-1">{user.email}</p>
            
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4 text-left">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted">
                 <span>Identity Verified</span>
                 <span className="text-green-500 flex items-center gap-1">
                   <Shield size={10} />
                   LEVEL 3
                 </span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full w-[92%] bg-gradient-to-r from-[#E9B3A2] to-[#AB9FF2]" />
               </div>
            </div>
          </Card>

          <AnimatePresence>
            {isPickerOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="luxe-card p-8 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest">Choose Avatar</p>
                  <button onClick={() => setIsPickerOpen(false)} className="text-muted hover:text-theme transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {avatars.map(seed => (
                    <button 
                      key={seed}
                      onClick={() => setTempAvatar(seed)}
                      className={`aspect-square rounded-xl overflow-hidden p-1 border-2 transition-all ${tempAvatar === seed ? "border-[#E9B3A2] bg-[#E9B3A2]/10 scale-110" : "border-white/5 hover:border-white/20"}`}
                    >
                      <Avatar seed={seed} />
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                   <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Custom Seed</p>
                   <input 
                    type="text" 
                    value={tempAvatar}
                    onChange={(e) => setTempAvatar(e.target.value)}
                    placeholder="Type anything..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 outline-none focus:border-[#E9B3A2]/30 text-xs font-bold"
                   />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="p-0 overflow-hidden">
             <div className="bg-phantom-accent/30 p-4 border-b border-white/5">
               <p className="text-[10px] font-black uppercase tracking-widest text-center text-gray-500">Zipzy ⚡ Certified Asset</p>
             </div>
             <div className="py-6">
               <ThreeDLogo />
             </div>
          </Card>
        </div>

        {/* Right: Details & Settings */}
        <div className="md:w-2/3 space-y-8">
          <Card title="Personal Details">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2 text-theme">
              <User size={20} className="text-[#E9B3A2]" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Display Name" value={user.name} />
              <InputGroup label="Email Address" value={user.email} />
              <div className="md:col-span-2">
                <InputGroup label="Bio" value={user.bio} isTextArea />
              </div>
            </div>
            <div className="mt-10">
              <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8">
              <h3 className="font-black mb-6 flex items-center gap-2 text-theme">
                <Shield size={18} className="text-[#16C784]" />
                Security
              </h3>
              <div className="space-y-4">
                <SettingsToggle label="Two-Factor Auth" enabled />
                <SettingsToggle label="Biometric Lock" enabled={false} />
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="font-black mb-6 flex items-center gap-2 text-theme">
                <Bell size={18} className="text-[#E9B3A2]" />
                Notifications
              </h3>
              <div className="space-y-4">
                <SettingsToggle label="Email Alerts" enabled />
                <SettingsToggle label="Push Notifications" enabled />
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}

function InputGroup({ label, value, isTextArea = false }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
      {isTextArea ? (
        <textarea 
          defaultValue={value}
          rows={3}
          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-phantom-purple/30 transition-all text-sm resize-none"
        />
      ) : (
        <input 
          type="text" 
          defaultValue={value}
          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 outline-none focus:border-phantom-purple/30 transition-all text-sm"
        />
      )}
    </div>
  );
}

function SettingsToggle({ label, enabled }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-bold text-gray-400">{label}</span>
      <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${enabled ? "bg-[#E9B3A2]" : "bg-white/10"}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full ${enabled ? "bg-[#121212]" : "bg-white/30"} transition-all ${enabled ? "right-1" : "left-1"}`} />
      </div>
    </div>
  );
}

// store/authStore.js
// Simplified: wallet connection = authentication
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // With wagmi, isAuthenticated is derived from wallet connection
  // This store is kept for backward compatibility with Login/Signup pages
  user: JSON.parse(localStorage.getItem("zipzy_user")) || null,
  isAuthenticated: true, // Always true — ProtectedRoute now uses wagmi's isConnected

  login: (userData) => {
    localStorage.setItem("zipzy_user", JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },

  signup: (userData) => {
    localStorage.setItem("zipzy_user", JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("zipzy_user");
    set({ user: null, isAuthenticated: false });
  },
}));

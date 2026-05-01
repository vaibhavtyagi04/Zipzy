import { API_BASE } from "../config/env";

const defaultHeaders = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error || payload?.message || "Authentication request failed";
    throw new Error(message);
  }

  return payload;
}

export const AuthService = {
  login: async (email, password) => {
    return await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (name, email, password) => {
    return await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  logout: async () => {
    return await request("/auth/logout", {
      method: "POST",
    });
  },

  checkSession: async () => {
    return await request("/auth/session", {
      method: "GET",
    });
  },

  requestWalletChallenge: async (address) => {
    return await request("/auth/wallet/challenge", {
      method: "POST",
      body: JSON.stringify({ address }),
    });
  },

  walletLogin: async (address, signature) => {
    return await request("/auth/wallet/login", {
      method: "POST",
      body: JSON.stringify({ address, signature }),
    });
  },
};

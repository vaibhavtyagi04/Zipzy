import { useEffect } from "react";
import { AuthService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

export function useAuthSession() {
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);

      try {
        const response = await AuthService.checkSession();
        if (response?.user) {
          setSession(response.user);
        } else {
          setSession(null);
        }
      } catch (error) {
        setSession(null);
      }
    };

    restoreSession();
  }, [setLoading, setSession]);
}


import { login, type AuthenticationRequest } from "@/api/generated";
import { useAuthStore } from "@/stores/auth";

export function useAuth() {
  const auth = useAuthStore();

  const doLogin = async (credentials: AuthenticationRequest) => {
    const response = await login(credentials);
    if (response.status === 200 && response.data.token) {
      auth.setSession(response.data.token, { username: credentials.username ?? "" });
      return true;
    }
    return false;
  };

  const logout = () => {
    auth.clear();
  };

  return { doLogin, logout, isAuthenticated: auth.isAuthenticated };
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loginRequest,
  meRequest,
  registerRequest,
} from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'puntos_liga_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authHeaders = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUser(null);
  };

  const fetchMe = async (currentToken) => {
    try {
      const data = await meRequest(currentToken);
      setUser(data.user);
    } catch (error) {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe(token);
  }, [token]);

  const login = async ({ identifier, password }) => {
    const data = await loginRequest({ identifier, password });

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const register = async ({
    username,
    first_name,
    last_name,
    email,
    password,
    confirmPassword,
    country_id,
  }) => {
    const data = await registerRequest({
      username,
      first_name,
      last_name,
      email,
      password,
      confirmPassword,
      country_id,
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    return data;
  };

  const logout = () => {
    clearSession();
  };

  const hasPermission = (permissionCode) => {
    return user?.permissions?.includes(permissionCode) || false;
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated: Boolean(token && user),
    authHeaders,
    login,
    register,
    logout,
    refreshMe: () => fetchMe(token),
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
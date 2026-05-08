import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import TokenStorage from '../utils/tokenStorage';
import AuthService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Init auth on mount
  useEffect(() => {
    const stored = TokenStorage.getUser();
    if (stored && TokenStorage.isAuthenticated()) {
      setUser(stored);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const showNotification = useCallback((type, title, message) => {
    const id = Date.now();
    setNotification({ id, type, title, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(email, password);
      if (result.success) {
        const { access_token, refresh_token, ...userData } = result.data;
        TokenStorage.saveTokens(access_token, refresh_token);
        TokenStorage.saveUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password, fullName, phone) => {
    setIsLoading(true);
    try {
      const result = await AuthService.register(email, password, fullName, phone);
      return result.success
        ? { success: true }
        : { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = TokenStorage.getAccessToken();
      if (token) await AuthService.logout(token);
    } catch (_) {}
    TokenStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback(async (fullName, phone) => {
    setIsLoading(true);
    try {
      const token = TokenStorage.getAccessToken();
      const result = await AuthService.updateProfile(fullName, phone, token);
      if (result.success) {
        const updated = { ...user, full_name: fullName, phone };
        TokenStorage.updateUser(updated);
        setUser(updated);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const changePassword = useCallback(async (oldPw, newPw, confirmPw) => {
    setIsLoading(true);
    try {
      const token = TokenStorage.getAccessToken();
      const result = await AuthService.changePassword(oldPw, newPw, confirmPw, token);
      return result.success ? { success: true } : { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoading,
      notification, showNotification,
      login, register, logout, updateProfile, changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;

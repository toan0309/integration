import { useState, useCallback, useEffect } from 'react';
import TokenStorage from '../utils/tokenStorage';
import AuthService from '../services/authService';

/**
 * useAuth Hook
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      const storedUser = TokenStorage.getUser();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.login(email, password);

      if (result.success) {
        const { access_token, refresh_token, ...userData } = result.data;
        TokenStorage.saveTokens(access_token, refresh_token);
        TokenStorage.saveUser(userData);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (email, password, fullName, phone = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.register(email, password, fullName, phone);

      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      const accessToken = TokenStorage.getAccessToken();
      if (accessToken) {
        await AuthService.logout(accessToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      TokenStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (oldPassword, newPassword, confirmPassword) => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = TokenStorage.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const result = await AuthService.changePassword(
        oldPassword,
        newPassword,
        confirmPassword,
        accessToken
      );

      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Password change failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (fullName, phone) => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = TokenStorage.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const result = await AuthService.updateProfile(fullName, phone, accessToken);

      if (result.success) {
        // Update local state
        const updated = { ...user, full_name: fullName, phone };
        TokenStorage.updateUser(updated);
        setUser(updated);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Profile update failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get profile
  const getProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = TokenStorage.getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const result = await AuthService.getProfile(accessToken);

      if (result.success) {
        TokenStorage.saveUser(result.data);
        setUser(result.data);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch profile';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    getProfile,
  };
};

/**
 * Authentication Utility Functions
 */

import TokenStorage from './tokenStorage';

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return TokenStorage.isAuthenticated();
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role) => {
  return TokenStorage.hasRole(role);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles) => {
  return TokenStorage.hasAnyRole(roles);
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  return TokenStorage.hasRole('admin');
};

/**
 * Get access token
 */
export const getAccessToken = () => {
  return TokenStorage.getAccessToken();
};

/**
 * Get user data
 */
export const getUser = () => {
  return TokenStorage.getUser();
};

/**
 * Get user ID
 */
export const getUserId = () => {
  return TokenStorage.getUserId();
};

/**
 * Get user email
 */
export const getUserEmail = () => {
  return TokenStorage.getUserEmail();
};

/**
 * Get user roles
 */
export const getUserRoles = () => {
  return TokenStorage.getUserRoles();
};

/**
 * Save authentication data
 */
export const saveAuth = (accessToken, refreshToken, user) => {
  TokenStorage.saveTokens(accessToken, refreshToken);
  TokenStorage.saveUser(user);
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  TokenStorage.clear();
};

/**
 * Update user profile
 */
export const updateUserProfile = (userData) => {
  TokenStorage.updateUser(userData);
};

/**
 * Parse JWT token (without verification - client-side only)
 */
export const parseToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = parseToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    // Convert exp (seconds) to milliseconds and compare with current time
    const expiryTime = decoded.exp * 1000;
    return expiryTime < Date.now();
  } catch (error) {
    return true;
  }
};

/**
 * Get time until token expires (in seconds)
 */
export const getTokenExpiryTime = (token) => {
  try {
    const decoded = parseToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    const expiryTime = decoded.exp * 1000;
    const timeRemaining = expiryTime - Date.now();
    return Math.floor(timeRemaining / 1000);
  } catch (error) {
    return null;
  }
};

export default {
  isAuthenticated,
  hasRole,
  hasAnyRole,
  isAdmin,
  getAccessToken,
  getUser,
  getUserId,
  getUserEmail,
  getUserRoles,
  saveAuth,
  clearAuth,
  updateUserProfile,
  parseToken,
  isTokenExpired,
  getTokenExpiryTime,
};

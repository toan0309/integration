/**
 * Token Storage Utility
 * Manages storage and retrieval of JWT tokens
 */

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

class TokenStorage {
  /**
   * Save tokens to local storage
   */
  static saveTokens(accessToken, refreshToken) {
    try {
      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  /**
   * Get access token
   */
  static getAccessToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token
   */
  static getRefreshToken() {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  }

  /**
   * Save user data
   */
  static saveUser(userData) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  /**
   * Get user data
   */
  static getUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    return !!this.getAccessToken();
  }

  /**
   * Check if token has specific role
   */
  static hasRole(role) {
    const user = this.getUser();
    return user && user.roles && user.roles.includes(role);
  }

  /**
   * Check if token has any of the specified roles
   */
  static hasAnyRole(roles) {
    const user = this.getUser();
    if (!user || !user.roles) return false;
    return roles.some(role => user.roles.includes(role));
  }

  /**
   * Clear all tokens and user data
   */
  static clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Update user data
   */
  static updateUser(userData) {
    const current = this.getUser();
    const updated = { ...current, ...userData };
    this.saveUser(updated);
  }

  /**
   * Get user ID
   */
  static getUserId() {
    const user = this.getUser();
    return user ? user.user_id : null;
  }

  /**
   * Get user email
   */
  static getUserEmail() {
    const user = this.getUser();
    return user ? user.email : null;
  }

  /**
   * Get user roles
   */
  static getUserRoles() {
    const user = this.getUser();
    return user ? user.roles || [] : [];
  }
}

export default TokenStorage;

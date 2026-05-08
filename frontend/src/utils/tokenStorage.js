const TOKEN_KEY = 'hr_access_token';
const REFRESH_KEY = 'hr_refresh_token';
const USER_KEY = 'hr_user';

const TokenStorage = {
  saveTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  },

  saveUser(userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  },

  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  updateUser(updated) {
    const current = this.getUser() || {};
    this.saveUser({ ...current, ...updated });
  },

  getUserRoles() {
    const user = this.getUser();
    if (!user) return [];
    // Support both [{ role_name }] and ['admin', ...] formats
    if (!user.roles) return [];
    return user.roles.map(r => {
      const roleName = typeof r === 'string' ? r : (r.role_name || r);
      return typeof roleName === 'string' ? roleName.toLowerCase() : '';
    });
  },

  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return !!token; // Treat as valid if can't decode
    }
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export default TokenStorage;

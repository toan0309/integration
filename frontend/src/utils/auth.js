import TokenStorage from './tokenStorage';

export const isAuthenticated = () => TokenStorage.isAuthenticated();

export const getUserRoles = () => TokenStorage.getUserRoles();

export const hasRole = (role) => getUserRoles().includes(role);

export const hasAnyRole = (roles = []) => roles.some(r => getUserRoles().includes(r));

export const isAdmin = () => hasRole('admin');

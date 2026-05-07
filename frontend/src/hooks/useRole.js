import { useState, useCallback } from 'react';
import TokenStorage from '../utils/tokenStorage';

/**
 * useRole Hook
 * Provides role and permission checking utilities
 */
export const useRole = () => {
  const [roles, setRoles] = useState(() => TokenStorage.getUserRoles());

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return roles.includes(role);
  }, [roles]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roleList) => {
    return roleList.some(role => roles.includes(role));
  }, [roles]);

  // Check if user has all specified roles
  const hasAllRoles = useCallback((roleList) => {
    return roleList.every(role => roles.includes(role));
  }, [roles]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return roles.includes('admin');
  }, [roles]);

  // Check if user is HR
  const isHR = useCallback(() => {
    return roles.includes('hr');
  }, [roles]);

  // Check if user is payroll
  const isPayroll = useCallback(() => {
    return roles.includes('payroll');
  }, [roles]);

  // Check if user is manager
  const isManager = useCallback(() => {
    return roles.includes('manager');
  }, [roles]);

  // Check if user is employee
  const isEmployee = useCallback(() => {
    return roles.includes('employee');
  }, [roles]);

  // Get current roles
  const getRoles = useCallback(() => {
    return roles;
  }, [roles]);

  // Update roles (typically after login or profile refresh)
  const updateRoles = useCallback((newRoles) => {
    setRoles(newRoles);
    TokenStorage.updateUser({ roles: newRoles });
  }, []);

  return {
    roles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isHR,
    isPayroll,
    isManager,
    isEmployee,
    getRoles,
    updateRoles,
  };
};

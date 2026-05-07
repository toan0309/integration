/**
 * Role Management API Service
 * Handles role and permission management
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class RoleService {
  /**
   * List all roles
   */
  static async listRoles(accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch roles');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get role by ID
   */
  static async getRole(roleId, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch role');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create new role
   */
  static async createRole(roleName, description, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          role_name: roleName,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create role');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update role
   */
  static async updateRole(roleId, roleName, description, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          role_name: roleName,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete role
   */
  static async deleteRole(roleId, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete role');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get role permissions
   */
  static async getRolePermissions(roleName, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/${roleName}/permissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch permissions');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all available permissions
   */
  static async getAllPermissions(accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/permissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch permissions');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if role has permission
   */
  static async checkPermission(roleName, permission, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/roles/${roleName}/check-permission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          permission,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check permission');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default RoleService;

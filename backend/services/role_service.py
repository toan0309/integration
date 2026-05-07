from typing import Tuple, Dict, List
from backend.database.db_auth_connector import auth_db
from backend.validation.auth_validation import auth_validation
from backend.auth.permission_checker import permission_checker

class RoleService:
    """Service for role and permission management"""
    
    @staticmethod
    def list_roles() -> Tuple[bool, Dict]:
        """Get all roles"""
        try:
            # TODO: Implement database query for list_roles
            # Would need a method in auth_db
            
            roles_data = []
            # Predefined roles with their permissions
            for role, permissions in permission_checker.ROLE_PERMISSIONS.items():
                roles_data.append({
                    'role_name': role,
                    'permissions': permissions,
                    'permission_count': len(permissions)
                })
            
            return True, {'roles': roles_data}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def get_role(role_id: int) -> Tuple[bool, Dict]:
        """Get role by ID"""
        try:
            # TODO: Implement database query for get_role
            
            return True, {
                'role_id': role_id,
                'role_name': 'Role Name',
                'description': 'Role Description',
                'permissions': []
            }
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def create_role(role_name: str, description: str = None) -> Tuple[bool, Dict]:
        """Create a new role"""
        try:
            # Validate role name
            is_valid, error = auth_validation.validate_role_name(role_name)
            if not is_valid:
                return False, {'error': error}
            
            # Create role
            success, role_id, msg = auth_db.create_role(role_name, description)
            
            if success:
                return True, {
                    'role_id': role_id,
                    'role_name': role_name,
                    'description': description,
                    'message': msg
                }
            else:
                return False, {'error': msg}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def update_role(role_id: int, role_name: str = None, description: str = None) -> Tuple[bool, Dict]:
        """Update role information"""
        try:
            if role_name:
                is_valid, error = auth_validation.validate_role_name(role_name)
                if not is_valid:
                    return False, {'error': error}
            
            # TODO: Implement database update for role
            
            return True, {'message': 'Role updated successfully'}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def delete_role(role_id: int) -> Tuple[bool, Dict]:
        """Delete a role"""
        try:
            # TODO: Check if role is in use before deleting
            
            return True, {'message': 'Role deleted successfully'}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def get_role_permissions(role_name: str) -> Tuple[bool, Dict]:
        """Get all permissions for a role"""
        try:
            permissions = permission_checker.get_role_permissions(role_name)
            
            if not permissions:
                return False, {'error': 'Role not found'}
            
            return True, {
                'role_name': role_name,
                'permissions': list(permissions),
                'permission_count': len(permissions)
            }
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def assign_permission_to_role(role_id: int, permission: str) -> Tuple[bool, Dict]:
        """Assign a permission to a role"""
        try:
            # TODO: Implement database operation to assign permission
            
            return True, {'message': 'Permission assigned successfully'}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def remove_permission_from_role(role_id: int, permission: str) -> Tuple[bool, Dict]:
        """Remove a permission from a role"""
        try:
            # TODO: Implement database operation to remove permission
            
            return True, {'message': 'Permission removed successfully'}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def get_all_available_permissions() -> Tuple[bool, Dict]:
        """Get all available permissions in the system"""
        try:
            all_permissions = set()
            
            # Collect all permissions from all roles
            for permissions in permission_checker.ROLE_PERMISSIONS.values():
                all_permissions.update(permissions)
            
            # Organize by category
            categories = {
                'user': [p for p in all_permissions if 'user' in p or 'role' in p or 'permission' in p],
                'employee': [p for p in all_permissions if 'employee' in p or 'department' in p or 'position' in p],
                'payroll': [p for p in all_permissions if 'payroll' in p or 'dividend' in p],
                'attendance': [p for p in all_permissions if 'attendance' in p],
                'reports': [p for p in all_permissions if 'report' in p or 'analytics' in p],
                'system': [p for p in all_permissions if 'audit' in p or 'alert' in p or 'settings' in p]
            }
            
            return True, {
                'permissions': list(all_permissions),
                'total_permissions': len(all_permissions),
                'categories': categories
            }
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def check_permission(role_name: str, permission: str) -> Tuple[bool, Dict]:
        """Check if a role has a specific permission"""
        try:
            has_permission = permission_checker.has_permission([role_name], permission)
            
            return True, {
                'role_name': role_name,
                'permission': permission,
                'has_permission': has_permission
            }
        except Exception as e:
            return False, {'error': str(e)}


role_service = RoleService()

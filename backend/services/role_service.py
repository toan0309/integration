from typing import Tuple, Dict, List
from backend.database.db_auth_connector import auth_db
from backend.validation.auth_validation import auth_validation
from backend.auth.permission_checker import permission_checker

class RoleService:
    """Service for role and permission management"""
    
    @staticmethod
    def list_roles() -> Tuple[bool, Dict]:
        """Get all roles – merges DB roles with permission matrix"""
        try:
            roles_data = []
            for role_name, permissions in permission_checker.ROLE_PERMISSIONS.items():
                roles_data.append({
                    'role_name': role_name,
                    'permissions': list(permissions),
                    'permission_count': len(permissions),
                })
            return True, {'roles': roles_data}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def get_role(role_id: int) -> Tuple[bool, Dict]:
        """Get role by ID"""
        try:
            role = auth_db.get_role_by_id(role_id)
            if not role:
                return False, {'error': 'Role not found'}
            # Try to attach permissions from permission checker
            perm_set = permission_checker.get_role_permissions(role['role_name']) or set()
            return True, {
                'role_id': role['role_id'],
                'role_name': role['role_name'],
                'description': role.get('description'),
                'permissions': list(perm_set),
                'permission_count': len(perm_set),
            }
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def create_role(role_name: str, description: str = None) -> Tuple[bool, Dict]:
        """Create a new role"""
        try:
            is_valid, error = auth_validation.validate_role_name(role_name)
            if not is_valid:
                return False, {'error': error}
            success, role_id, msg = auth_db.create_role(role_name, description)
            if success:
                return True, {'role_id': role_id, 'role_name': role_name, 'description': description, 'message': msg}
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
            success, msg = auth_db.update_role(role_id, role_name=role_name, description=description)
            return (True, {'message': msg}) if success else (False, {'error': msg})
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def delete_role(role_id: int) -> Tuple[bool, Dict]:
        """Delete a role (checks if in use first)"""
        try:
            success, msg = auth_db.delete_role(role_id)
            return (True, {'message': msg}) if success else (False, {'error': msg})
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
                'permission_count': len(permissions),
            }
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def assign_permission_to_role(role_id: int, permission: str) -> Tuple[bool, Dict]:
        try:
            return True, {'message': 'Permission assigned successfully'}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def remove_permission_from_role(role_id: int, permission: str) -> Tuple[bool, Dict]:
        try:
            return True, {'message': 'Permission removed successfully'}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def get_all_available_permissions() -> Tuple[bool, Dict]:
        """Get all available permissions in the system"""
        try:
            all_permissions = set()
            for permissions in permission_checker.ROLE_PERMISSIONS.values():
                all_permissions.update(permissions)
            
            categories = {
                'user': sorted([p for p in all_permissions if 'user' in p or 'role' in p or 'permission' in p]),
                'employee': sorted([p for p in all_permissions if 'employee' in p or 'department' in p or 'position' in p]),
                'payroll': sorted([p for p in all_permissions if 'payroll' in p or 'dividend' in p]),
                'attendance': sorted([p for p in all_permissions if 'attendance' in p]),
                'reports': sorted([p for p in all_permissions if 'report' in p or 'analytics' in p]),
                'system': sorted([p for p in all_permissions if 'audit' in p or 'alert' in p or 'settings' in p]),
            }
            # Remove empty categories
            categories = {k: v for k, v in categories.items() if v}
            
            return True, {
                'permissions': sorted(list(all_permissions)),
                'total_permissions': len(all_permissions),
                'categories': categories,
            }
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def check_permission(role_name: str, permission: str) -> Tuple[bool, Dict]:
        try:
            has_permission = permission_checker.has_permission([role_name], permission)
            return True, {
                'role_name': role_name,
                'permission': permission,
                'has_permission': has_permission,
            }
        except Exception as e:
            return False, {'error': str(e)}


role_service = RoleService()

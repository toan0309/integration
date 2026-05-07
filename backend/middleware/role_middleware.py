from flask import request, jsonify
from functools import wraps
from typing import List, Callable, Optional
from backend.auth.permission_checker import permission_checker

def require_role(*roles):
    """
    Decorator to require user to have one of the specified roles
    
    Usage:
        @app.route('/admin')
        @token_required
        @require_role('admin')
        def admin_endpoint():
            ...
        
        @app.route('/manager-or-admin')
        @token_required
        @require_role('admin', 'manager')
        def manager_endpoint():
            ...
    """
    def decorator(f: Callable):
        @wraps(f)
        def decorated(*args, **kwargs):
            # Check if user is authenticated (token_required should be applied first)
            if not hasattr(request, 'user_roles') or request.user_roles is None:
                return jsonify({
                    'error': 'Unauthorized',
                    'message': 'User not authenticated'
                }), 401
            
            user_roles = request.user_roles
            
            # Check if user has any of the required roles
            if not permission_checker.has_any_permission(user_roles, list(roles)):
                return jsonify({
                    'error': 'Forbidden',
                    'message': f'Access denied. Required roles: {", ".join(roles)}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    
    return decorator

def require_permission(permission: str):
    """
    Decorator to require user to have a specific permission
    
    Usage:
        @app.route('/manage-users')
        @token_required
        @require_permission('manage_users')
        def manage_users():
            ...
    """
    def decorator(f: Callable):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user_roles') or request.user_roles is None:
                return jsonify({
                    'error': 'Unauthorized',
                    'message': 'User not authenticated'
                }), 401
            
            if not permission_checker.has_permission(request.user_roles, permission):
                return jsonify({
                    'error': 'Forbidden',
                    'message': f'Access denied. Required permission: {permission}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    
    return decorator

def require_all_permissions(*permissions):
    """
    Decorator to require user to have all specified permissions
    
    Usage:
        @app.route('/critical-operation')
        @token_required
        @require_all_permissions('manage_users', 'system_settings')
        def critical_operation():
            ...
    """
    def decorator(f: Callable):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user_roles') or request.user_roles is None:
                return jsonify({
                    'error': 'Unauthorized',
                    'message': 'User not authenticated'
                }), 401
            
            if not permission_checker.has_all_permissions(request.user_roles, list(permissions)):
                return jsonify({
                    'error': 'Forbidden',
                    'message': f'Access denied. Required permissions: {", ".join(permissions)}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    
    return decorator

def require_resource_access(resource: str, action: str = 'read'):
    """
    Decorator to require access to a specific resource with a specific action
    
    Usage:
        @app.route('/employees', methods=['POST'])
        @token_required
        @require_resource_access('employee', 'create')
        def create_employee():
            ...
    """
    def decorator(f: Callable):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user_roles') or request.user_roles is None:
                return jsonify({
                    'error': 'Unauthorized',
                    'message': 'User not authenticated'
                }), 401
            
            if not permission_checker.can_access_resource(request.user_roles, resource, action):
                return jsonify({
                    'error': 'Forbidden',
                    'message': f'Access denied. Cannot {action} {resource}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    
    return decorator

def admin_required(f: Callable):
    """
    Decorator to require user to be admin
    
    Usage:
        @app.route('/admin-only')
        @token_required
        @admin_required
        def admin_only_endpoint():
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, 'user_roles') or request.user_roles is None:
            return jsonify({
                'error': 'Unauthorized',
                'message': 'User not authenticated'
            }), 401
        
        if not permission_checker.is_admin(request.user_roles):
            return jsonify({
                'error': 'Forbidden',
                'message': 'Admin access required'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated

class RoleMiddleware:
    """Role and permission checking middleware class"""
    
    @staticmethod
    def check_role(user_roles: List[str], required_roles: List[str]) -> bool:
        """
        Check if user has any of the required roles
        
        Args:
            user_roles: User's list of roles
            required_roles: Required roles (OR condition - any one is sufficient)
            
        Returns:
            True if user has any required role
        """
        return permission_checker.has_any_permission(user_roles, required_roles)
    
    @staticmethod
    def check_permission(user_roles: List[str], permission: str) -> bool:
        """
        Check if user has a specific permission
        
        Args:
            user_roles: User's list of roles
            permission: Permission to check
            
        Returns:
            True if user has the permission
        """
        return permission_checker.has_permission(user_roles, permission)
    
    @staticmethod
    def check_all_permissions(user_roles: List[str], permissions: List[str]) -> bool:
        """
        Check if user has all specified permissions
        
        Args:
            user_roles: User's list of roles
            permissions: List of permissions that all must be present
            
        Returns:
            True if user has all permissions
        """
        return permission_checker.has_all_permissions(user_roles, permissions)
    
    @staticmethod
    def get_accessible_resources(user_roles: List[str]) -> dict:
        """
        Get all resources and actions accessible to user
        
        Args:
            user_roles: User's list of roles
            
        Returns:
            Dictionary of accessible resources and actions
        """
        return permission_checker.get_accessible_resources(user_roles)
    
    @staticmethod
    def is_admin(user_roles: List[str]) -> bool:
        """
        Check if user is admin
        
        Args:
            user_roles: User's list of roles
            
        Returns:
            True if user is admin
        """
        return permission_checker.is_admin(user_roles)

role_middleware = RoleMiddleware()

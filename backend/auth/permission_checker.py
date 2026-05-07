from typing import List, Set, Optional

class PermissionChecker:
    """Handle permission checking for roles and resources"""
    
    # Define role hierarchies and permissions
    ROLE_PERMISSIONS = {
        'admin': [
            'manage_users',
            'manage_roles',
            'manage_permissions',
            'view_reports',
            'view_analytics',
            'manage_employees',
            'manage_departments',
            'manage_positions',
            'manage_payroll',
            'manage_attendance',
            'manage_alerts',
            'manage_dividends',
            'audit_logs',
            'system_settings'
        ],
        'hr': [
            'manage_employees',
            'manage_departments',
            'manage_positions',
            'view_attendance',
            'view_payroll',
            'view_reports',
            'manage_alerts'
        ],
        'payroll': [
            'manage_payroll',
            'view_employees',
            'view_reports',
            'manage_dividends'
        ],
        'employee': [
            'view_profile',
            'view_attendance',
            'view_payroll',
            'change_password'
        ],
        'manager': [
            'view_team_attendance',
            'view_team_performance',
            'approve_attendance',
            'view_reports'
        ],
        'guest': [
            'view_public_info'
        ]
    }
    
    # Resource-based permissions
    RESOURCE_PERMISSIONS = {
        'employee': ['create', 'read', 'update', 'delete'],
        'department': ['create', 'read', 'update', 'delete'],
        'position': ['create', 'read', 'update', 'delete'],
        'payroll': ['create', 'read', 'update', 'delete'],
        'attendance': ['create', 'read', 'update', 'delete'],
        'report': ['create', 'read', 'export'],
        'user': ['create', 'read', 'update', 'delete', 'reset_password'],
        'role': ['create', 'read', 'update', 'delete'],
        'permission': ['read', 'update']
    }
    
    @staticmethod
    def get_role_permissions(role: str) -> Set[str]:
        """
        Get all permissions for a given role
        
        Args:
            role: Role name (case-insensitive)
            
        Returns:
            Set of permission strings
        """
        role_lower = role.lower()
        return set(PermissionChecker.ROLE_PERMISSIONS.get(role_lower, []))
    
    @staticmethod
    def has_permission(roles: List[str], required_permission: str) -> bool:
        """
        Check if any of the given roles has a specific permission
        
        Args:
            roles: List of role names
            required_permission: Permission to check
            
        Returns:
            True if any role has the permission
        """
        for role in roles:
            permissions = PermissionChecker.get_role_permissions(role)
            if required_permission in permissions:
                return True
        return False
    
    @staticmethod
    def has_any_permission(roles: List[str], permissions: List[str]) -> bool:
        """
        Check if any of the given roles has any of the required permissions
        
        Args:
            roles: List of role names
            permissions: List of permissions to check
            
        Returns:
            True if any role has any of the permissions
        """
        for permission in permissions:
            if PermissionChecker.has_permission(roles, permission):
                return True
        return False
    
    @staticmethod
    def has_all_permissions(roles: List[str], permissions: List[str]) -> bool:
        """
        Check if the given roles have all required permissions
        
        Args:
            roles: List of role names
            permissions: List of permissions that must all be present
            
        Returns:
            True if all permissions are present in the roles
        """
        for permission in permissions:
            if not PermissionChecker.has_permission(roles, permission):
                return False
        return True
    
    @staticmethod
    def can_access_resource(roles: List[str], resource: str, action: str) -> bool:
        """
        Check if roles can perform an action on a resource
        
        Args:
            roles: List of role names
            resource: Resource name
            action: Action to perform (create, read, update, delete, etc)
            
        Returns:
            True if access is allowed
        """
        # Check role-based permissions first
        required_permission = f"{action}_{resource}"
        if PermissionChecker.has_permission(roles, required_permission):
            return True
        
        # Admin always has access
        if PermissionChecker.has_permission(roles, 'admin'):
            return True
        
        return False
    
    @staticmethod
    def get_accessible_resources(roles: List[str]) -> dict:
        """
        Get all accessible resources and their allowed actions for given roles
        
        Args:
            roles: List of role names
            
        Returns:
            Dictionary mapping resources to allowed actions
        """
        accessible = {}
        all_permissions = set()
        
        for role in roles:
            all_permissions.update(PermissionChecker.get_role_permissions(role))
        
        for resource, actions in PermissionChecker.RESOURCE_PERMISSIONS.items():
            accessible_actions = []
            for action in actions:
                permission = f"{action}_{resource}"
                if permission in all_permissions or 'manage_' + resource in all_permissions:
                    accessible_actions.append(action)
            
            if accessible_actions:
                accessible[resource] = accessible_actions
        
        return accessible
    
    @staticmethod
    def is_admin(roles: List[str]) -> bool:
        """
        Check if user has admin role
        
        Args:
            roles: List of role names
            
        Returns:
            True if 'admin' is in roles
        """
        return 'admin' in [role.lower() for role in roles]


permission_checker = PermissionChecker()

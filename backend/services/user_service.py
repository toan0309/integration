from typing import Tuple, List, Dict, Optional
from backend.database.db_auth_connector import auth_db
from backend.validation.auth_validation import auth_validation
from backend.auth.password_hasher import password_hasher

class UserService:
    """Service for user management operations"""
    
    @staticmethod
    def list_users(page: int = 1, per_page: int = 10, search: str = None) -> Tuple[bool, Dict]:
        """
        Get list of users with pagination and search
        
        Args:
            page: Page number (1-indexed)
            per_page: Items per page
            search: Search term for email or name
            
        Returns:
            Tuple of (success, response_dict)
        """
        try:
            # TODO: Implement database query for list_users
            # This would need a new method in auth_db
            
            return True, {
                'users': [],
                'total': 0,
                'page': page,
                'per_page': per_page
            }
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def get_user(user_id: int) -> Tuple[bool, Dict]:
        """Get user by ID"""
        try:
            user = auth_db.get_user_by_id(user_id)
            
            if not user:
                return False, {'error': 'User not found'}
            
            # Get user roles
            roles = auth_db.get_user_roles(user_id)
            role_list = [{'role_id': r['role_id'], 'role_name': r['role_name']} for r in roles]
            
            return True, {
                'user_id': user['user_id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'phone': user['phone'],
                'employee_id': user['employee_id'],
                'is_active': user['is_active'],
                'roles': role_list,
                'last_login': user['last_login'],
                'created_at': user['created_at']
            }
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def create_user(email: str, full_name: str, password: str = None, 
                   phone: str = None, employee_id: int = None) -> Tuple[bool, Dict]:
        """
        Create a new user
        
        Args:
            email: User email
            full_name: User full name
            password: Optional password (auto-generated if not provided)
            phone: Optional phone number
            employee_id: Optional employee ID
            
        Returns:
            Tuple of (success, response_dict)
        """
        try:
            # Validate email
            is_valid, error = auth_validation.validate_email(email)
            if not is_valid:
                return False, {'error': error}
            
            # Validate full name
            is_valid, error = auth_validation.validate_full_name(full_name)
            if not is_valid:
                return False, {'error': error}
            
            # Validate phone if provided
            if phone:
                is_valid, error = auth_validation.validate_phone(phone)
                if not is_valid:
                    return False, {'error': error}
            
            # Check if user exists
            existing = auth_db.get_user_by_email(email.strip().lower())
            if existing:
                return False, {'error': 'Email already registered'}
            
            # Generate password if not provided
            if not password:
                import secrets
                password = secrets.token_urlsafe(12)
            
            # Validate password strength
            is_valid, error = auth_validation.validate_password(password)
            if not is_valid:
                return False, {'error': error}
            
            # Hash password
            password_hash = password_hasher.hash_password(password)
            
            # Create user
            success, user_id, msg = auth_db.create_user(
                email=email.strip().lower(),
                full_name=full_name,
                password_hash=password_hash,
                phone=phone,
                employee_id=employee_id
            )
            
            if not success:
                return False, {'error': msg}
            
            # Assign default employee role
            auth_db.add_user_role(user_id, 3)
            
            return True, {
                'user_id': user_id,
                'email': email,
                'full_name': full_name,
                'message': 'User created successfully',
                'temporary_password': password if not password else None
            }
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def update_user(user_id: int, full_name: str = None, phone: str = None,
                   employee_id: int = None) -> Tuple[bool, Dict]:
        """Update user information"""
        try:
            user = auth_db.get_user_by_id(user_id)
            if not user:
                return False, {'error': 'User not found'}
            
            # Validate inputs if provided
            if full_name:
                is_valid, error = auth_validation.validate_full_name(full_name)
                if not is_valid:
                    return False, {'error': error}
            
            if phone:
                is_valid, error = auth_validation.validate_phone(phone)
                if not is_valid:
                    return False, {'error': error}
            
            # TODO: Implement database update
            # Would need an update method in auth_db
            
            return True, {'message': 'User updated successfully'}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def delete_user(user_id: int) -> Tuple[bool, Dict]:
        """Disable/delete a user"""
        try:
            user = auth_db.get_user_by_id(user_id)
            if not user:
                return False, {'error': 'User not found'}
            
            success, msg = auth_db.disable_user(user_id)
            
            if success:
                return True, {'message': msg}
            else:
                return False, {'error': msg}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def enable_user(user_id: int) -> Tuple[bool, Dict]:
        """Enable a user account"""
        try:
            user = auth_db.get_user_by_id(user_id)
            if not user:
                return False, {'error': 'User not found'}
            
            success, msg = auth_db.enable_user(user_id)
            
            if success:
                return True, {'message': msg}
            else:
                return False, {'error': msg}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def assign_role(user_id: int, role_id: int) -> Tuple[bool, Dict]:
        """Assign a role to a user"""
        try:
            user = auth_db.get_user_by_id(user_id)
            if not user:
                return False, {'error': 'User not found'}
            
            success, msg = auth_db.add_user_role(user_id, role_id)
            
            if success:
                return True, {'message': msg}
            else:
                return False, {'error': msg}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def remove_role(user_id: int, role_id: int) -> Tuple[bool, Dict]:
        """Remove a role from a user"""
        try:
            user = auth_db.get_user_by_id(user_id)
            if not user:
                return False, {'error': 'User not found'}
            
            success, msg = auth_db.remove_user_role(user_id, role_id)
            
            if success:
                return True, {'message': msg}
            else:
                return False, {'error': msg}
        except Exception as e:
            return False, {'error': str(e)}
    
    @staticmethod
    def reset_user_password(user_id: int, new_password: str = None) -> Tuple[bool, Dict]:
        """Reset user password by admin"""
        try:
            user = auth_db.get_user_by_id(user_id)
            if not user:
                return False, {'error': 'User not found'}
            
            # Generate password if not provided
            if not new_password:
                import secrets
                new_password = secrets.token_urlsafe(12)
            
            # Validate password strength
            is_valid, error = auth_validation.validate_password(new_password)
            if not is_valid:
                return False, {'error': error}
            
            # Hash and update password
            password_hash = password_hasher.hash_password(new_password)
            success, msg = auth_db.update_user_password(user_id, password_hash)
            
            if success:
                return True, {
                    'message': msg,
                    'temporary_password': new_password
                }
            else:
                return False, {'error': msg}
        except Exception as e:
            return False, {'error': str(e)}


user_service = UserService()

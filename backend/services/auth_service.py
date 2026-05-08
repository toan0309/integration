from datetime import datetime, timedelta
from typing import Tuple, Optional, Dict
from backend.database.db_auth_connector import auth_db
from backend.auth.jwt_handler import jwt_handler
from backend.auth.password_hasher import password_hasher
from backend.validation.auth_validation import auth_validation
from backend.services.email_service import email_service
import secrets
import random
import os

class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def register_user(email: str, password: str, full_name: str, 
                     phone: str = None, employee_id: int = None) -> Tuple[bool, Dict]:
        """
        Register a new user
        
        Args:
            email: User email
            password: Plain text password
            full_name: User's full name
            phone: Optional phone number
            employee_id: Optional employee ID
            
        Returns:
            Tuple of (success, response_dict)
        """
        # Validate input
        is_valid, error = auth_validation.validate_registration_data(
            email, password, full_name, phone
        )
        
        if not is_valid:
            return False, {'error': error}
        
        # Check if user already exists
        existing_user = auth_db.get_user_by_email(email.strip().lower())
        if existing_user:
            return False, {'error': 'Email already registered'}
        
        # Hash password
        password_hash = password_hasher.hash_password(password)
        
        # Create user in database
        success, user_id, message = auth_db.create_user(
            email=email.strip().lower(),
            full_name=full_name,
            password_hash=password_hash,
            phone=phone,
            employee_id=employee_id
        )
        
        if not success:
            return False, {'error': message}
        
        # Assign default 'employee' role
        role_success, role_msg = auth_db.add_user_role(user_id, 3)  # Assuming 3 is 'employee' role
        
        return True, {
            'user_id': user_id,
            'email': email,
            'message': 'User registered successfully',
            'next_action': 'Please login with your credentials'
        }
    
    @staticmethod
    def login(email: str, password: str) -> Tuple[bool, Dict]:
        """
        Authenticate user and generate tokens
        
        Args:
            email: User email
            password: Plain text password
            
        Returns:
            Tuple of (success, response_dict)
        """
        # Validate input
        is_valid, error = auth_validation.validate_login_data(email, password)
        if not is_valid:
            return False, {'error': error}
        
        # Get user by email
        user = auth_db.get_user_by_email(email.strip().lower())
        if not user:
            return False, {'error': 'Invalid credentials'}
        
        # Check if user is active
        if not user.get('is_active'):
            return False, {'error': 'Account is disabled'}
        
        # Verify password
        if not password_hasher.verify_password(password, user.get('password_hash')):
            return False, {'error': 'Invalid credentials'}
        
        # Get user roles
        roles = auth_db.get_user_roles(user['user_id'])
        role_names = [role['role_name'].lower() for role in roles]
        
        # Create tokens
        access_token = jwt_handler.create_access_token(
            user_id=user['user_id'],
            email=user['email'],
            roles=role_names
        )
        
        refresh_token = jwt_handler.create_refresh_token(user['user_id'])
        
        # Update last login
        auth_db.update_last_login(user['user_id'])
        
        return True, {
            'user_id': user['user_id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'roles': role_names,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': 3600
        }
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> Tuple[bool, Dict]:
        """
        Generate new access token using refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            Tuple of (success, response_dict)
        """
        is_valid, new_access_token = jwt_handler.refresh_access_token(refresh_token)
        
        if not is_valid:
            return False, {'error': 'Invalid or expired refresh token'}
        
        return True, {
            'access_token': new_access_token,
            'token_type': 'Bearer',
            'expires_in': 3600
        }
    
    @staticmethod
    def request_password_reset(email: str) -> Tuple[bool, Dict]:
        """
        Request password reset - generate reset token and send email
        
        Args:
            email: User email
            
        Returns:
            Tuple of (success, response_dict)
        """
        # Validate email
        is_valid, error = auth_validation.validate_email(email)
        if not is_valid:
            return False, {'error': error}
        
        # Get user
        user = auth_db.get_user_by_email(email.strip().lower())
        if not user:
            return False, {'error': 'Email is not registered in the system'}
        
        # Generate 6-digit OTP
        reset_token = f"{random.randint(0, 999999):06d}"
        expires_at = datetime.now() + timedelta(hours=1)
        
        # Store token in database
        success, msg = auth_db.create_reset_token(
            user_id=user['user_id'],
            token=reset_token,
            expires_at=expires_at
        )
        
        if not success:
            return False, {'error': 'Failed to create reset token'}
        
        # Send email with OTP asynchronously
        email_service.send_otp_email(email, reset_token)
        
        return True, {
            'message': 'A 6-digit verification code has been sent to your email.'
        }
    
    @staticmethod
    def verify_reset_token(token: str) -> Tuple[bool, Dict]:
        """
        Verify that a reset token is valid
        
        Args:
            token: Password reset token
            
        Returns:
            Tuple of (success, response_dict)
        """
        reset_data = auth_db.get_reset_token(token)
        
        if not reset_data:
            return False, {'error': 'Invalid or expired reset token'}
        
        return True, {
            'user_id': reset_data['user_id'],
            'message': 'Token is valid'
        }
    
    @staticmethod
    def reset_password(token: str, password: str, confirm_password: str) -> Tuple[bool, Dict]:
        """
        Reset user password with valid reset token
        
        Args:
            token: Password reset token
            password: New password
            confirm_password: Password confirmation
            
        Returns:
            Tuple of (success, response_dict)
        """
        # Validate passwords
        is_valid, error = auth_validation.validate_password_reset(password, confirm_password)
        if not is_valid:
            return False, {'error': error}
        
        # Verify reset token
        reset_data = auth_db.get_reset_token(token)
        if not reset_data:
            return False, {'error': 'Invalid or expired reset token'}
        
        user_id = reset_data['user_id']
        
        # Hash new password
        password_hash = password_hasher.hash_password(password)
        
        # Update user password
        success, msg = auth_db.update_user_password(user_id, password_hash)
        
        if not success:
            return False, {'error': msg}
        
        # Mark token as used
        auth_db.mark_reset_token_used(reset_data['reset_id'])
        
        return True, {
            'message': 'Password has been reset successfully',
            'next_action': 'Please login with your new password'
        }
    
    @staticmethod
    def change_password(user_id: int, old_password: str, new_password: str, 
                       confirm_password: str) -> Tuple[bool, Dict]:
        """
        Change user password (requires old password)
        
        Args:
            user_id: User ID
            old_password: Current password
            new_password: New password
            confirm_password: Password confirmation
            
        Returns:
            Tuple of (success, response_dict)
        """
        # Validate passwords
        is_valid, error = auth_validation.validate_password_change(
            old_password, new_password, confirm_password
        )
        if not is_valid:
            return False, {'error': error}
        
        # Get user
        user = auth_db.get_user_by_id(user_id)
        if not user:
            return False, {'error': 'User not found'}
        
        # Verify old password
        if not password_hasher.verify_password(old_password, user.get('password_hash')):
            return False, {'error': 'Current password is incorrect'}
        
        # Hash new password
        password_hash = password_hasher.hash_password(new_password)
        
        # Update password
        success, msg = auth_db.update_user_password(user_id, password_hash)
        
        if not success:
            return False, {'error': msg}
        
        return True, {
            'message': 'Password changed successfully'
        }
    
    @staticmethod
    def get_user_profile(user_id: int) -> Tuple[bool, Dict]:
        """
        Get user profile information
        
        Args:
            user_id: User ID
            
        Returns:
            Tuple of (success, user_data)
        """
        user = auth_db.get_user_by_id(user_id)
        
        if not user:
            return False, {'error': 'User not found'}
        
        # Get user roles
        roles = auth_db.get_user_roles(user_id)
        role_names = [role['role_name'].lower() for role in roles]
        
        return True, {
            'user_id': user['user_id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'phone': user['phone'],
            'roles': role_names,
            'is_active': user['is_active'],
            'last_login': user['last_login'],
            'created_at': user['created_at']
        }
    
    @staticmethod
    def update_user_profile(user_id: int, full_name: str = None, phone: str = None) -> Tuple[bool, Dict]:
        """
        Update user profile information
        
        Args:
            user_id: User ID
            full_name: New full name
            phone: New phone number
            
        Returns:
            Tuple of (success, response_dict)
        """
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
        
        # TODO: Update user profile in database
        # This would require a method in auth_db for updating profile
        
        return True, {
            'message': 'Profile updated successfully'
        }


auth_service = AuthService()

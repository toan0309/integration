import re
from typing import Tuple, Optional

class AuthValidation:
    """Validation for authentication inputs"""
    
    @staticmethod
    def validate_email(email: str) -> Tuple[bool, str]:
        """
        Validate email format
        
        Args:
            email: Email to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not email or not isinstance(email, str):
            return False, "Email is required"
        
        email = email.strip().lower()
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(pattern, email):
            return False, "Invalid email format"
        
        if len(email) > 255:
            return False, "Email is too long"
        
        return True, ""
    
    @staticmethod
    def validate_password(password: str) -> Tuple[bool, str]:
        """
        Validate password requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        
        Args:
            password: Password to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not password or not isinstance(password, str):
            return False, "Password is required"
        
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if len(password) > 128:
            return False, "Password is too long"
        
        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter (A-Z)"
        
        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter (a-z)"
        
        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one digit (0-9)"
        
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?~`"
        if not any(c in special_chars for c in password):
            return False, "Password must contain at least one special character (!@#$%^&*)"
        
        return True, ""
    
    @staticmethod
    def validate_full_name(full_name: str) -> Tuple[bool, str]:
        """
        Validate full name
        
        Args:
            full_name: Full name to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not full_name or not isinstance(full_name, str):
            return False, "Full name is required"
        
        full_name = full_name.strip()
        
        if len(full_name) < 2:
            return False, "Full name must be at least 2 characters"
        
        if len(full_name) > 255:
            return False, "Full name is too long"
        
        # Allow letters, spaces, hyphens, and apostrophes
        if not re.match(r"^[a-zA-Z\s\-']+$", full_name):
            return False, "Full name contains invalid characters"
        
        return True, ""
    
    @staticmethod
    def validate_phone(phone: str) -> Tuple[bool, str]:
        """
        Validate phone number format
        
        Args:
            phone: Phone number to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not phone:
            return True, ""  # Phone is optional
        
        if not isinstance(phone, str):
            return False, "Phone must be a string"
        
        # Remove common separators
        phone_cleaned = re.sub(r'[\s\-().+]', '', phone)
        
        if not phone_cleaned.isdigit():
            return False, "Phone must contain only digits and common separators"
        
        if len(phone_cleaned) < 10 or len(phone_cleaned) > 15:
            return False, "Phone number must be between 10 and 15 digits"
        
        return True, ""
    
    @staticmethod
    def validate_registration_data(email: str, password: str, full_name: str, 
                                   phone: str = None) -> Tuple[bool, str]:
        """
        Validate complete registration data
        
        Args:
            email: Email address
            password: Password
            full_name: User full name
            phone: Phone number (optional)
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Validate email
        is_valid, error = AuthValidation.validate_email(email)
        if not is_valid:
            return False, error
        
        # Validate password
        is_valid, error = AuthValidation.validate_password(password)
        if not is_valid:
            return False, error
        
        # Validate full name
        is_valid, error = AuthValidation.validate_full_name(full_name)
        if not is_valid:
            return False, error
        
        # Validate phone if provided
        if phone:
            is_valid, error = AuthValidation.validate_phone(phone)
            if not is_valid:
                return False, error
        
        return True, ""
    
    @staticmethod
    def validate_login_data(email: str, password: str) -> Tuple[bool, str]:
        """
        Validate login credentials format
        
        Args:
            email: Email address
            password: Password
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not email or not password:
            return False, "Email and password are required"
        
        # Basic validation without checking against password rules
        is_valid, error = AuthValidation.validate_email(email)
        if not is_valid:
            return False, error
        
        if not isinstance(password, str) or len(password) == 0:
            return False, "Password is required"
        
        return True, ""
    
    @staticmethod
    def validate_password_change(old_password: str, new_password: str, 
                                confirm_password: str) -> Tuple[bool, str]:
        """
        Validate password change request
        
        Args:
            old_password: Current password
            new_password: New password
            confirm_password: Confirmation of new password
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not old_password or not new_password or not confirm_password:
            return False, "All password fields are required"
        
        if new_password != confirm_password:
            return False, "New passwords do not match"
        
        if old_password == new_password:
            return False, "New password must be different from current password"
        
        # Validate new password strength
        is_valid, error = AuthValidation.validate_password(new_password)
        if not is_valid:
            return False, error
        
        return True, ""
    
    @staticmethod
    def validate_password_reset(password: str, confirm_password: str) -> Tuple[bool, str]:
        """
        Validate password reset request
        
        Args:
            password: New password
            confirm_password: Confirmation of new password
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not password or not confirm_password:
            return False, "All fields are required"
        
        if password != confirm_password:
            return False, "Passwords do not match"
        
        # Validate password strength
        is_valid, error = AuthValidation.validate_password(password)
        if not is_valid:
            return False, error
        
        return True, ""
    
    @staticmethod
    def validate_role_name(role_name: str) -> Tuple[bool, str]:
        """
        Validate role name
        
        Args:
            role_name: Role name to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not role_name or not isinstance(role_name, str):
            return False, "Role name is required"
        
        role_name = role_name.strip()
        
        if len(role_name) < 2:
            return False, "Role name must be at least 2 characters"
        
        if len(role_name) > 50:
            return False, "Role name must be less than 50 characters"
        
        if not re.match(r"^[a-zA-Z0-9_\-]+$", role_name):
            return False, "Role name can only contain letters, numbers, hyphens, and underscores"
        
        return True, ""


auth_validation = AuthValidation()

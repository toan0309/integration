from werkzeug.security import generate_password_hash, check_password_hash
from typing import Tuple

class PasswordHasher:
    """Handle password hashing and verification"""
    
    def __init__(self, method: str = 'pbkdf2:sha256', salt_length: int = 8):
        """
        Initialize password hasher
        
        Args:
            method: Hashing method (pbkdf2:sha256 is default and recommended)
            salt_length: Length of salt for hashing
        """
        self.method = method
        self.salt_length = salt_length
    
    def hash_password(self, password: str) -> str:
        """
        Hash a password
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password string
        """
        return generate_password_hash(
            password,
            method=self.method,
            salt_length=self.salt_length
        )
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash
        
        Args:
            password: Plain text password to verify
            hashed_password: Hashed password to check against
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            return check_password_hash(hashed_password, password)
        except Exception:
            return False
    
    def validate_password_strength(self, password: str) -> Tuple[bool, str]:
        """
        Validate password strength
        
        Requirements:
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
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        
        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        
        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one digit"
        
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(c in special_chars for c in password):
            return False, "Password must contain at least one special character"
        
        return True, "Password is strong"


password_hasher = PasswordHasher()

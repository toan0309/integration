import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple

class JWTHandler:
    """Handle JWT token creation, validation, and refresh"""
    
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
        self.algorithm = 'HS256'
        self.access_token_expiry = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRY', 3600))  # 1 hour
        self.refresh_token_expiry = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRY', 2592000))  # 30 days
    
    def create_access_token(self, user_id: int, email: str, roles: list = None) -> str:
        """
        Create an access token
        
        Args:
            user_id: User ID
            email: User email
            roles: List of user roles
            
        Returns:
            Encoded JWT token
        """
        payload = {
            'user_id': user_id,
            'email': email,
            'roles': roles or [],
            'type': 'access',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(seconds=self.access_token_expiry)
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: int) -> str:
        """
        Create a refresh token
        
        Args:
            user_id: User ID
            
        Returns:
            Encoded JWT token
        """
        payload = {
            'user_id': user_id,
            'type': 'refresh',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(seconds=self.refresh_token_expiry)
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Tuple[bool, Optional[Dict]]:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT token to verify
            
        Returns:
            Tuple of (is_valid, payload_dict)
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return True, payload
        except jwt.ExpiredSignatureError:
            return False, {'error': 'Token has expired'}
        except jwt.InvalidTokenError:
            return False, {'error': 'Invalid token'}
        except Exception as e:
            return False, {'error': str(e)}
    
    def decode_token(self, token: str, verify: bool = True) -> Optional[Dict]:
        """
        Decode JWT token
        
        Args:
            token: JWT token to decode
            verify: Whether to verify the token signature
            
        Returns:
            Decoded payload or None if invalid
        """
        try:
            if verify:
                return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            else:
                return jwt.decode(token, options={"verify_signature": False})
        except Exception as e:
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Tuple[bool, Optional[str]]:
        """
        Generate new access token from refresh token
        
        Args:
            refresh_token: Valid refresh token
            
        Returns:
            Tuple of (success, new_access_token)
        """
        is_valid, payload = self.verify_token(refresh_token)
        
        if not is_valid or payload.get('type') != 'refresh':
            return False, None
        
        user_id = payload.get('user_id')
        email = payload.get('email', '')
        roles = payload.get('roles', [])
        
        new_access_token = self.create_access_token(user_id, email, roles)
        return True, new_access_token


jwt_handler = JWTHandler()

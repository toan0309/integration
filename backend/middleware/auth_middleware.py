from flask import request, jsonify
from functools import wraps
from typing import Optional, Tuple
from backend.auth.jwt_handler import jwt_handler
from backend.database.db_auth_connector import auth_db

def extract_token_from_request() -> Optional[str]:
    """
    Extract JWT token from request header
    
    Expected format: Authorization: Bearer <token>
    
    Returns:
        Token string or None
    """
    auth_header = request.headers.get('Authorization', '')
    
    if not auth_header.startswith('Bearer '):
        return None
    
    return auth_header[7:]  # Remove 'Bearer ' prefix

def verify_token() -> Tuple[bool, Optional[dict], dict]:
    """
    Verify JWT token from request
    
    Returns:
        Tuple of (is_valid, payload, error_response)
    """
    token = extract_token_from_request()
    
    if not token:
        return False, None, {
            'error': 'Missing authorization token',
            'message': 'Authorization header with Bearer token is required'
        }
    
    is_valid, payload = jwt_handler.verify_token(token)
    
    if not is_valid:
        return False, None, {
            'error': payload.get('error', 'Invalid token'),
            'message': 'Token is invalid or expired'
        }
    
    return True, payload, {}

def token_required(f):
    """
    Decorator to require valid JWT token
    
    Usage:
        @app.route('/protected')
        @token_required
        def protected_route():
            user_id = request.user_id
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        is_valid, payload, error_response = verify_token()
        
        if not is_valid:
            return jsonify(error_response), 401
        
        # Store user info in request context
        request.user_id = payload.get('user_id')
        request.user_email = payload.get('email')
        request.user_roles = payload.get('roles', [])
        request.token_payload = payload
        
        return f(*args, **kwargs)
    
    return decorated

def optional_token(f):
    """
    Decorator to optionally accept JWT token (does not require it)
    
    Sets user info in request context if token is provided and valid
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        is_valid, payload, _ = verify_token()
        
        if is_valid:
            request.user_id = payload.get('user_id')
            request.user_email = payload.get('email')
            request.user_roles = payload.get('roles', [])
            request.token_payload = payload
            request.is_authenticated = True
        else:
            request.is_authenticated = False
            request.user_id = None
            request.user_email = None
            request.user_roles = []
            request.token_payload = None
        
        return f(*args, **kwargs)
    
    return decorated

def refresh_token_required(f):
    """
    Decorator to require valid refresh token
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = extract_token_from_request()
        
        if not token:
            return jsonify({
                'error': 'Missing refresh token',
                'message': 'Authorization header with Bearer token is required'
            }), 401
        
        is_valid, payload = jwt_handler.verify_token(token)
        
        if not is_valid or payload.get('type') != 'refresh':
            return jsonify({
                'error': 'Invalid refresh token',
                'message': 'Refresh token is invalid or expired'
            }), 401
        
        request.user_id = payload.get('user_id')
        request.token_payload = payload
        
        return f(*args, **kwargs)
    
    return decorated

class AuthMiddleware:
    """Authentication middleware class"""
    
    @staticmethod
    def verify_user_exists(user_id: int) -> Tuple[bool, Optional[dict]]:
        """
        Verify that user exists and is active
        
        Returns:
            Tuple of (exists, user_data)
        """
        try:
            user = auth_db.get_user_by_id(user_id)
            if user and user.get('is_active'):
                return True, user
            return False, None
        except Exception:
            return False, None
    
    @staticmethod
    def get_user_with_roles(user_id: int) -> Optional[dict]:
        """
        Get user data including roles
        
        Returns:
            User dict with roles list, or None
        """
        try:
            user = auth_db.get_user_by_id(user_id)
            if user:
                roles = auth_db.get_user_roles(user_id)
                user['roles'] = [role['role_name'] for role in roles]
                return user
            return None
        except Exception:
            return None

auth_middleware = AuthMiddleware()

from flask import Blueprint, jsonify, request
from backend.services.auth_service import auth_service
from backend.middleware.auth_middleware import token_required, refresh_token_required
from backend.middleware.role_middleware import require_role
from backend.utils.error_handler import error_response, success_response

auth_routes_bp = Blueprint("auth_routes", __name__)

# Register endpoint
@auth_routes_bp.route("/api/auth/register", methods=["POST"])
def register():
    """
    Register a new user
    
    Expected JSON:
    {
        "email": "user@example.com",
        "password": "Secure@Pass123",
        "full_name": "John Doe",
        "phone": "+1234567890" (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        full_name = data.get('full_name', '').strip()
        phone = data.get('phone', '').strip() if data.get('phone') else None
        
        if not all([email, password, full_name]):
            return error_response("Email, password, and full name are required", 400)
        
        success, result = auth_service.register_user(email, password, full_name, phone)
        
        if success:
            return success_response(result, 201)
        else:
            return error_response(result.get('error', 'Registration failed'), 400)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Login endpoint
@auth_routes_bp.route("/api/auth/login", methods=["POST"])
def login():
    """
    Login user and get tokens
    
    Expected JSON:
    {
        "email": "user@example.com",
        "password": "Secure@Pass123"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return error_response("Email and password are required", 400)
        
        success, result = auth_service.login(email, password)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Login failed'), 401)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Refresh token endpoint
@auth_routes_bp.route("/api/auth/refresh-token", methods=["POST"])
@refresh_token_required
def refresh_token():
    """
    Generate new access token from refresh token
    
    Expected header:
    Authorization: Bearer <refresh_token>
    """
    try:
        refresh_token_val = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        success, result = auth_service.refresh_access_token(refresh_token_val)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Token refresh failed'), 401)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Forgot password endpoint
@auth_routes_bp.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    """
    Request password reset
    
    Expected JSON:
    {
        "email": "user@example.com"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        email = data.get('email', '').strip()
        
        if not email:
            return error_response("Email is required", 400)
        
        success, result = auth_service.request_password_reset(email)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Request failed'), 400)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Verify reset token endpoint
@auth_routes_bp.route("/api/auth/verify-reset-token", methods=["POST"])
def verify_reset_token():
    """
    Verify password reset token
    
    Expected JSON:
    {
        "token": "reset_token_string"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        token = data.get('token', '').strip()
        
        if not token:
            return error_response("Token is required", 400)
        
        success, result = auth_service.verify_reset_token(token)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Invalid token'), 400)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Reset password endpoint
@auth_routes_bp.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    """
    Reset password with valid reset token
    
    Expected JSON:
    {
        "token": "reset_token_string",
        "password": "NewSecure@Pass123",
        "confirm_password": "NewSecure@Pass123"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        token = data.get('token', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        
        if not all([token, password, confirm_password]):
            return error_response("Token and passwords are required", 400)
        
        success, result = auth_service.reset_password(token, password, confirm_password)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Password reset failed'), 400)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Change password endpoint (requires authentication)
@auth_routes_bp.route("/api/auth/change-password", methods=["POST"])
@token_required
def change_password():
    """
    Change password for authenticated user
    
    Expected header:
    Authorization: Bearer <access_token>
    
    Expected JSON:
    {
        "old_password": "Current@Pass123",
        "new_password": "NewSecure@Pass123",
        "confirm_password": "NewSecure@Pass123"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        confirm_password = data.get('confirm_password', '')
        
        if not all([old_password, new_password, confirm_password]):
            return error_response("All password fields are required", 400)
        
        success, result = auth_service.change_password(
            request.user_id, old_password, new_password, confirm_password
        )
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Password change failed'), 400)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Get user profile endpoint
@auth_routes_bp.route("/api/auth/profile", methods=["GET"])
@token_required
def get_profile():
    """
    Get current user profile
    
    Expected header:
    Authorization: Bearer <access_token>
    """
    try:
        success, result = auth_service.get_user_profile(request.user_id)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'User not found'), 404)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Update user profile endpoint
@auth_routes_bp.route("/api/auth/profile", methods=["PUT"])
@token_required
def update_profile():
    """
    Update current user profile
    
    Expected header:
    Authorization: Bearer <access_token>
    
    Expected JSON:
    {
        "full_name": "Jane Doe" (optional),
        "phone": "+9876543210" (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        full_name = data.get('full_name', '').strip() if data.get('full_name') else None
        phone = data.get('phone', '').strip() if data.get('phone') else None
        
        if not full_name and not phone:
            return error_response("At least one field (full_name or phone) is required", 400)
        
        success, result = auth_service.update_user_profile(request.user_id, full_name, phone)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Update failed'), 400)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Logout endpoint (client-side operation, but can be used for server-side cleanup)
@auth_routes_bp.route("/api/auth/logout", methods=["POST"])
@token_required
def logout():
    """
    Logout user (primarily client-side - token invalidation can be handled on frontend)
    
    Expected header:
    Authorization: Bearer <access_token>
    """
    try:
        # TODO: Optional - implement token blacklist/revocation system
        return success_response({
            'message': 'Logged out successfully'
        }, 200)
    
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

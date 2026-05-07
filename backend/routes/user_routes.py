from flask import Blueprint, jsonify, request
from backend.services.user_service import user_service
from backend.middleware.auth_middleware import token_required
from backend.middleware.role_middleware import require_role, admin_required
from backend.utils.error_handler import error_response, success_response

user_routes_bp = Blueprint("user_routes", __name__)

# List all users (admin only)
@user_routes_bp.route("/api/users", methods=["GET"])
@token_required
@admin_required
def list_users():
    """Get paginated list of users"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str)
        
        success, result = user_service.list_users(page, per_page, search)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to list users'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Get user by ID (admin or self)
@user_routes_bp.route("/api/users/<int:user_id>", methods=["GET"])
@token_required
def get_user(user_id: int):
    """Get user details"""
    try:
        # Users can only view their own profile unless they're admin
        if user_id != request.user_id and 'admin' not in request.user_roles:
            return error_response("Access denied", 403)
        
        success, result = user_service.get_user(user_id)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'User not found'), 404)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Create new user (admin only)
@user_routes_bp.route("/api/users", methods=["POST"])
@token_required
@admin_required
def create_user():
    """Create new user"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        email = data.get('email', '').strip()
        full_name = data.get('full_name', '').strip()
        password = data.get('password', '').strip() if data.get('password') else None
        phone = data.get('phone', '').strip() if data.get('phone') else None
        employee_id = data.get('employee_id')
        
        if not email or not full_name:
            return error_response("Email and full name are required", 400)
        
        success, result = user_service.create_user(email, full_name, password, phone, employee_id)
        
        if success:
            return success_response(result, 201)
        else:
            return error_response(result.get('error', 'Failed to create user'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Update user (admin only)
@user_routes_bp.route("/api/users/<int:user_id>", methods=["PUT"])
@token_required
@admin_required
def update_user(user_id: int):
    """Update user information"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        full_name = data.get('full_name', '').strip() if data.get('full_name') else None
        phone = data.get('phone', '').strip() if data.get('phone') else None
        employee_id = data.get('employee_id')
        
        if not full_name and not phone and not employee_id:
            return error_response("At least one field is required", 400)
        
        success, result = user_service.update_user(user_id, full_name, phone, employee_id)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to update user'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Delete user (admin only)
@user_routes_bp.route("/api/users/<int:user_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_user(user_id: int):
    """Disable user account"""
    try:
        success, result = user_service.delete_user(user_id)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to delete user'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Enable user (admin only)
@user_routes_bp.route("/api/users/<int:user_id>/enable", methods=["POST"])
@token_required
@admin_required
def enable_user(user_id: int):
    """Enable user account"""
    try:
        success, result = user_service.enable_user(user_id)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to enable user'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Assign role to user (admin only)
@user_routes_bp.route("/api/users/<int:user_id>/roles", methods=["POST"])
@token_required
@admin_required
def assign_role(user_id: int):
    """Assign role to user"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        role_id = data.get('role_id')
        
        if not role_id:
            return error_response("Role ID is required", 400)
        
        success, result = user_service.assign_role(user_id, role_id)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to assign role'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Remove role from user (admin only)
@user_routes_bp.route("/api/users/<int:user_id>/roles/<int:role_id>", methods=["DELETE"])
@token_required
@admin_required
def remove_role(user_id: int, role_id: int):
    """Remove role from user"""
    try:
        success, result = user_service.remove_role(user_id, role_id)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to remove role'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Reset user password (admin only)
@user_routes_bp.route("/api/users/<int:user_id>/reset-password", methods=["POST"])
@token_required
@admin_required
def reset_user_password(user_id: int):
    """Reset user password"""
    try:
        data = request.get_json() or {}
        new_password = data.get('password', '').strip() if data.get('password') else None
        
        success, result = user_service.reset_user_password(user_id, new_password)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to reset password'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

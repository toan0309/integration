from flask import Blueprint, jsonify, request
from backend.services.role_service import role_service
from backend.middleware.auth_middleware import token_required
from backend.middleware.role_middleware import admin_required
from backend.utils.error_handler import error_response, success_response

role_routes_bp = Blueprint("role_routes", __name__)

# List all roles
@role_routes_bp.route("/api/roles", methods=["GET"])
@token_required
def list_roles():
    """Get all available roles"""
    try:
        success, result = role_service.list_roles()
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to list roles'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Get role by ID
@role_routes_bp.route("/api/roles/<int:role_id>", methods=["GET"])
@token_required
def get_role(role_id: int):
    """Get role details"""
    try:
        success, result = role_service.get_role(role_id)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Role not found'), 404)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Create new role (admin only)
@role_routes_bp.route("/api/roles", methods=["POST"])
@token_required
@admin_required
def create_role():
    """Create new role"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        role_name = data.get('role_name', '').strip()
        description = data.get('description', '').strip() if data.get('description') else None
        
        if not role_name:
            return error_response("Role name is required", 400)
        
        success, result = role_service.create_role(role_name, description)
        
        if success:
            return success_response(result, 201)
        else:
            return error_response(result.get('error', 'Failed to create role'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Update role (admin only)
@role_routes_bp.route("/api/roles/<int:role_id>", methods=["PUT"])
@token_required
@admin_required
def update_role(role_id: int):
    """Update role information"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        role_name = data.get('role_name', '').strip() if data.get('role_name') else None
        description = data.get('description', '').strip() if data.get('description') else None
        
        if not role_name and not description:
            return error_response("At least one field is required", 400)
        
        success, result = role_service.update_role(role_id, role_name, description)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to update role'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Delete role (admin only)
@role_routes_bp.route("/api/roles/<int:role_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_role(role_id: int):
    """Delete role"""
    try:
        success, result = role_service.delete_role(role_id)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to delete role'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Get role permissions
@role_routes_bp.route("/api/roles/<role_name>/permissions", methods=["GET"])
@token_required
def get_role_permissions(role_name: str):
    """Get all permissions for a role"""
    try:
        success, result = role_service.get_role_permissions(role_name)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Role not found'), 404)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Get all available permissions
@role_routes_bp.route("/api/permissions", methods=["GET"])
@token_required
def get_all_permissions():
    """Get all available permissions in the system"""
    try:
        success, result = role_service.get_all_available_permissions()
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Failed to fetch permissions'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

# Check role permission
@role_routes_bp.route("/api/roles/<role_name>/check-permission", methods=["POST"])
@token_required
def check_permission(role_name: str):
    """Check if a role has a specific permission"""
    try:
        data = request.get_json()
        
        if not data:
            return error_response("Request body is required", 400)
        
        permission = data.get('permission', '').strip()
        
        if not permission:
            return error_response("Permission is required", 400)
        
        success, result = role_service.check_permission(role_name, permission)
        
        if success:
            return success_response(result, 200)
        else:
            return error_response(result.get('error', 'Check failed'), 400)
    except Exception as e:
        return error_response(f"Server error: {str(e)}", 500)

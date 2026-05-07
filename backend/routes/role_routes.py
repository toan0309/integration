from flask import Blueprint, jsonify

role_routes_bp = Blueprint("role_routes", __name__)

@role_routes_bp.route("/api/role", methods=["GET"])
def get_role_routes():
    return jsonify({
        "message": "role_routes working"
    })

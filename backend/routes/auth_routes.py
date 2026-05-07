from flask import Blueprint, jsonify

auth_routes_bp = Blueprint("auth_routes", __name__)

@auth_routes_bp.route("/api/auth", methods=["GET"])
def get_auth_routes():
    return jsonify({
        "message": "auth_routes working"
    })

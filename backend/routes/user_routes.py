from flask import Blueprint, jsonify

user_routes_bp = Blueprint("user_routes", __name__)

@user_routes_bp.route("/api/user", methods=["GET"])
def get_user_routes():
    return jsonify({
        "message": "user_routes working"
    })

from flask import Blueprint, jsonify

dashboard_routes_bp = Blueprint("dashboard_routes", __name__)

@dashboard_routes_bp.route("/api/dashboard", methods=["GET"])
def get_dashboard_routes():
    return jsonify({
        "message": "dashboard_routes working"
    })

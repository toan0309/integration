from flask import Blueprint, jsonify

alert_routes_bp = Blueprint("alert_routes", __name__)

@alert_routes_bp.route("/api/alert", methods=["GET"])
def get_alert_routes():
    return jsonify({
        "message": "alert_routes working"
    })

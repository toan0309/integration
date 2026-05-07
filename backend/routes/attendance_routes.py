from flask import Blueprint, jsonify

attendance_routes_bp = Blueprint("attendance_routes", __name__)

@attendance_routes_bp.route("/api/attendance", methods=["GET"])
def get_attendance_routes():
    return jsonify({
        "message": "attendance_routes working"
    })

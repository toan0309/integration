from flask import Blueprint, jsonify

department_routes_bp = Blueprint("department_routes", __name__)

@department_routes_bp.route("/api/department", methods=["GET"])
def get_department_routes():
    return jsonify({
        "message": "department_routes working"
    })

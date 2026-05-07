from flask import Blueprint, jsonify

employee_routes_bp = Blueprint("employee_routes", __name__)

@employee_routes_bp.route("/api/employee", methods=["GET"])
def get_employee_routes():
    return jsonify({
        "message": "employee_routes working"
    })

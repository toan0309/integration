from flask import Blueprint, jsonify

payroll_routes_bp = Blueprint("payroll_routes", __name__)

@payroll_routes_bp.route("/api/payroll", methods=["GET"])
def get_payroll_routes():
    return jsonify({
        "message": "payroll_routes working"
    })

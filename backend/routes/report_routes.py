from flask import Blueprint, jsonify

report_routes_bp = Blueprint("report_routes", __name__)

@report_routes_bp.route("/api/report", methods=["GET"])
def get_report_routes():
    return jsonify({
        "message": "report_routes working"
    })

from flask import Blueprint, jsonify

audit_routes_bp = Blueprint("audit_routes", __name__)

@audit_routes_bp.route("/api/audit", methods=["GET"])
def get_audit_routes():
    return jsonify({
        "message": "audit_routes working"
    })

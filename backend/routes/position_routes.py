from flask import Blueprint, jsonify

position_routes_bp = Blueprint("position_routes", __name__)

@position_routes_bp.route("/api/position", methods=["GET"])
def get_position_routes():
    return jsonify({
        "message": "position_routes working"
    })

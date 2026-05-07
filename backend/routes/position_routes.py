from flask import Blueprint, jsonify
from services.position_service import get_positions

position_bp = Blueprint("position", __name__)


@position_bp.route("/api/positions", methods=["GET"])
def positions():
    try:
        data = get_positions()
        return jsonify(data), 200
    except Exception as error:
        return jsonify({
            "message": "Cannot load positions",
            "error": str(error)
        }), 500
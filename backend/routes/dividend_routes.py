from flask import Blueprint, jsonify

dividend_routes_bp = Blueprint("dividend_routes", __name__)

@dividend_routes_bp.route("/api/dividend", methods=["GET"])
def get_dividend_routes():
    return jsonify({
        "message": "dividend_routes working"
    })

from flask import Blueprint, jsonify
from services.department_service import get_departments

department_bp = Blueprint("department", __name__)


@department_bp.route("/api/departments", methods=["GET"])
def departments():
    try:
        data = get_departments()
        return jsonify(data), 200
    except Exception as error:
        return jsonify({
            "message": "Cannot load departments",
            "error": str(error)
        }), 500
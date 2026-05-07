from flask import Blueprint, jsonify

from database.db_hr_connector import get_hr_connection
from database.db_payroll_connector import get_payroll_connection
from database.db_auth_connector import get_auth_connection

health_bp = Blueprint("health", __name__)

@health_bp.route("/api/health", methods=["GET"])
def health():

    result = {
        "backend": "running",
        "sql_server": "failed",
        "payroll_mysql": "failed",
        "auth_mysql": "failed"
    }

    try:
        conn = get_hr_connection()
        conn.close()
        result["sql_server"] = "connected"
    except Exception as error:
        result["sql_server_error"] = str(error)

    try:
        conn = get_payroll_connection()
        conn.close()
        result["payroll_mysql"] = "connected"
    except Exception as error:
        result["payroll_mysql_error"] = str(error)

    try:
        conn = get_auth_connection()
        conn.close()
        result["auth_mysql"] = "connected"
    except Exception as error:
        result["auth_mysql_error"] = str(error)

    return jsonify(result)

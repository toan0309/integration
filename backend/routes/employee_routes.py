from flask import Blueprint, jsonify, request

from services.employee_service import (
    get_employees,
    add_employee,
    update_employee,
    delete_employee
)

employee_bp = Blueprint("employee", __name__)


@employee_bp.route("/api/employees", methods=["GET"])
def employees():
    try:
        data = get_employees()

        return jsonify({
            "total": len(data),
            "employees": data
        }), 200

    except Exception as error:
        return jsonify({
            "message": "Cannot load employees",
            "error": str(error)
        }), 500


@employee_bp.route("/api/employees", methods=["POST"])
def create_employee():
    try:
        payload = request.get_json()
        result = add_employee(payload)

        return jsonify(result), 201

    except Exception as error:
        return jsonify({
            "message": "Cannot add employee",
            "error": str(error)
        }), 500


@employee_bp.route("/api/employees/<int:employee_id>", methods=["PUT"])
def edit_employee(employee_id):
    try:
        payload = request.get_json()
        result = update_employee(employee_id, payload)

        return jsonify(result), 200

    except Exception as error:
        return jsonify({
            "message": "Cannot update employee",
            "error": str(error)
        }), 500


@employee_bp.route("/api/employees/<int:employee_id>", methods=["DELETE"])
def remove_employee(employee_id):
    try:
        result = delete_employee(employee_id)

        return jsonify(result), 200

    except Exception as error:
        return jsonify({
            "message": "Cannot delete employee",
            "error": str(error)
        }), 500
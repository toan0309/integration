# report_routes.py
from flask import Blueprint, request, jsonify
from services.attendance_service import get_attendance_summary_logic

report_routes_bp = Blueprint("report_routes", __name__, url_prefix='/api/reports')

@report_routes_bp.route("/attendance", methods=["GET"])
def get_attendance_report():
    """Lấy báo cáo chấm công tổng hợp"""
    try:
        year_month = request.args.get('yearMonth')
        if not year_month:
            return jsonify({'success': False, 'message': 'yearMonth is required'}), 400
            
        result = get_attendance_summary_logic(year_month)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@report_routes_bp.route("/status", methods=["GET"])
def get_report_status():
    return jsonify({
        "success": True,
        "message": "Report service is active"
    })

# attendance_routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime

# Import Services & Logic từ các modules đã tách
from services.attendance_service import (
    get_today_attendance_logic,
    get_all_employees_logic,
    get_dashboard_stats_logic,
    get_departments_logic,
    get_positions_logic,
    get_attendance_summary_logic,
    get_excessive_leave_logic,
    get_available_months_logic,
    get_analytics_logic
)

# Tao blueprint voi url_prefix
attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

# ==================== ATTENDANCE ROUTES ====================

# 1. LẤY DANH SÁCH CHẤM CÔNG HÔM NAY
@attendance_bp.route('/today', methods=['GET'])
def get_today_attendance():
    """Lấy danh sách chấm công theo ngày"""
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        result = get_today_attendance_logic(date)
        return jsonify(result)
    except Exception as e:
        print(f"Error get_today_attendance: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# 2. LẤY DANH SÁCH TẤT CẢ NHÂN VIÊN
@attendance_bp.route('/employees', methods=['GET'])
def get_all_employees():
    """Lấy danh sách tất cả nhân viên"""
    try:
        result = get_all_employees_logic()
        return jsonify(result)
    except Exception as e:
        print(f"Error get_all_employees: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# 3. LẤY TỔNG HỢP CHẤM CÔNG THEO THÁNG
@attendance_bp.route('/summary', methods=['GET'])
def get_summary():
    """Lấy tổng hợp chấm công theo tháng"""
    try:
        year_month = request.args.get('yearMonth', None)
        result = get_attendance_summary_logic(year_month)
        return jsonify(result)
    except Exception as e:
        print(f"Error get_summary: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# 4. LẤY DANH SÁCH CẢNH BÁO NGHỈ PHÉP QUÁ MỨC
@attendance_bp.route('/excessive-leave', methods=['GET'])
def get_excessive_leave():
    """Lấy danh sách nhân viên nghỉ phép quá mức"""
    try:
        year = request.args.get('year', datetime.now().year)
        dept_filter = request.args.get('department', 'ALL')
        severity_filter = request.args.get('severity', 'ALL')
        status_filter = request.args.get('status', 'ALL')
        
        result = get_excessive_leave_logic(year, dept_filter, severity_filter, status_filter)
        return jsonify(result)
    except Exception as e:
        print(f"Error get_excessive_leave: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# 5. THỐNG KÊ NHANH CHO DASHBOARD
@attendance_bp.route('/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    """Lấy thống kê nhanh cho dashboard"""
    try:
        result = get_dashboard_stats_logic()
        return jsonify(result)
    except Exception as e:
        print(f"Error get_dashboard_stats: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# 6. LẤY DANH SÁCH PHÒNG BAN
@attendance_bp.route('/departments', methods=['GET'])
def get_departments():
    """Lấy danh sách phòng ban"""
    try:
        result = get_departments_logic()
        return jsonify(result)
    except Exception as e:
        print(f"Error get_available_months: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# 9. LẤY DỮ LIỆU PHÂN TÍCH XU HƯỚNG
@attendance_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Lấy dữ liệu phân tích xu hướng theo năm"""
    try:
        year = request.args.get('year', datetime.now().year)
        result = get_analytics_logic(year)
        return jsonify(result)
    except Exception as e:
        print(f"Error get_analytics: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# 7. LẤY DANH SÁCH CHỨC VỤ
@attendance_bp.route('/positions', methods=['GET'])
def get_positions():
    """Lấy danh sách chức vụ"""
    try:
        result = get_positions_logic()
        return jsonify(result)
    except Exception as e:
        print(f"Error get_positions: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


# 8. LẤY DANH SÁCH CÁC THÁNG CÓ DỮ LIỆU
@attendance_bp.route('/available-months', methods=['GET'])
def get_available_months():
    """Lấy danh sách các tháng có dữ liệu"""
    try:
        result = get_available_months_logic()
        return jsonify(result)
    except Exception as e:
        print(f"Error get_available_months: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
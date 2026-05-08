# attendance_analytics.py
from database.db_payroll_connector import get_mysql_connection
from datetime import datetime

def get_attendance_analytics_logic(year):
    """Phân tích dữ liệu chấm công theo năm từ MySQL"""
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Thống kê tổng WorkDays, AbsentDays, LeaveDays theo từng tháng trong năm
        cursor.execute("""
            SELECT 
                MONTH(AttendanceMonth) as month,
                SUM(WorkDays) as total_work,
                SUM(AbsentDays) as total_absent,
                SUM(LeaveDays) as total_leave
            FROM attendance
            WHERE YEAR(AttendanceMonth) = %s
            GROUP BY MONTH(AttendanceMonth)
            ORDER BY month
        """, (year,))
        
        results = cursor.fetchall()
        conn.close()
        
        # Chuyển đổi sang định dạng chart
        months_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        chart_data = []
        
        for i in range(1, 13):
            month_record = next((r for r in results if r['month'] == i), None)
            if month_record:
                chart_data.append({
                    "name": months_labels[i-1],
                    "work": int(month_record['total_work']),
                    "absent": int(month_record['total_absent']),
                    "leave": int(month_record['total_leave'])
                })
            else:
                chart_data.append({
                    "name": months_labels[i-1],
                    "work": 0,
                    "absent": 0,
                    "leave": 0
                })
                
        return {
            "success": True,
            "year": year,
            "data": chart_data
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

# leave_alert.py
from database.db_hr_connector import get_hr_connection
from datetime import datetime

def check_leave_alerts():
    """Kiểm tra các cảnh báo về nghỉ phép từ Database SQL Server"""
    try:
        conn = get_hr_connection()
        cursor = conn.cursor()
        
        # Tìm các nhân viên đang có trạng thái Nghỉ phép
        cursor.execute("""
            SELECT EmployeeID, FullName, DepartmentID 
            FROM Employees 
            WHERE Status = N'Nghỉ phép'
        """)
        
        columns = [column[0] for column in cursor.description]
        employees_on_leave = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        
        leave_alerts = []
        for emp in employees_on_leave:
            leave_alerts.append({
                "employee": emp["FullName"],
                "message": f"🔔 {emp['FullName']} đang trong trạng thái Nghỉ phép.",
                "type": "current",
            })
            
        return leave_alerts
    except Exception as e:
        print(f"Error check_leave_alerts: {e}")
        return []

if __name__ == "__main__":
    alerts = check_leave_alerts()
    
    if alerts:
        print("📢 Leave Alerts:")
        for alert in alerts:
            print(f"- {alert['message']}")
    else:
        print("No leave alerts for today.")

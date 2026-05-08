# anniversary_alert.py
from database.db_hr_connector import get_hr_connection
from datetime import datetime

def check_anniversary():
    """Kiểm tra kỷ niệm ngày làm việc từ Database SQL Server (HR)"""
    try:
        conn = get_hr_connection()
        cursor = conn.cursor()
        
        today = datetime.now()
        current_month = today.month
        current_day = today.day
        
        # Lấy tất cả nhân viên có HireDate trong tháng hiện tại
        cursor.execute("""
            SELECT EmployeeID, FullName, HireDate, Status 
            FROM Employees 
            WHERE MONTH(HireDate) = ? AND Status != 'Nghỉ việc'
        """, (current_month,))
        
        # Lấy tên cột để tạo dictionary
        columns = [column[0] for column in cursor.description]
        employees = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()
        
        anniversaries = []
        for emp in employees:
            hire_date = emp.get('HireDate')
            if not hire_date:
                continue
            
            # Xử lý datetime nếu cần (phụ thuộc vào pyodbc trả về loại nào)
            if isinstance(hire_date, str):
                try:
                    hire_date = datetime.strptime(hire_date.split(' ')[0], '%Y-%m-%d')
                except ValueError:
                    continue
                    
            years = today.year - hire_date.year
            if years <= 0: continue # Chưa đủ 1 năm
            
            # Đúng ngày kỷ niệm
            if hire_date.day == current_day:
                anniversaries.append({
                    "employee": emp["FullName"],
                    "hire_date": hire_date.strftime('%Y-%m-%d'),
                    "year": years,
                    "type": "exact",
                    "message": f"Chúc mừng {emp['FullName']} kỷ niệm {years} năm làm việc! 🎉"
                })
            
            # Sắp tới trong tuần (từ ngày mai đến 7 ngày tới)
            days_diff = (hire_date.replace(year=today.year) - today).days
            if 0 < days_diff <= 7:
                anniversaries.append({
                    "employee": emp["FullName"],
                    "hire_date": hire_date.strftime('%Y-%m-%d'),
                    "year": years,
                    "type": "this_week",
                    "days_remaining": days_diff,
                    "message": f"Sắp tới: {emp['FullName']} sẽ kỷ niệm {years} năm vào {days_diff} ngày nữa."
                })
                
        return anniversaries
    except Exception as e:
        print(f"Error check_anniversary: {e}")
        return []

if __name__ == "__main__":
    alerts = check_anniversary()
    
    if alerts:
        print("📢 Anniversary Alerts:")
        for alert in alerts:
            print(f"- {alert['message']}")
    else:
        print("No anniversary alerts for today.")

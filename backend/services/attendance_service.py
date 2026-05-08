# attendance_service.py
from database.db_payroll_connector import get_mysql_connection
from datetime import datetime

def fmt_dt(v):
    """Chuyen datetime Python sang ISO string cho frontend"""
    if v is None:
        return None
    if hasattr(v, 'isoformat'):
        return v.isoformat()
    return str(v)

def get_status_text(status):
    """Chuyển đổi status sang text hiển thị"""
    status_map = {
        'Present': 'Đi làm',
        'Late': 'Đi muộn',
        'Absent': 'Vắng mặt',
        'Leave': 'Nghỉ phép',
        'Sick': 'Nghỉ ốm',
        'Early': 'Về sớm',
        'Holiday': 'Nghỉ lễ'
    }
    return status_map.get(status, status)

def get_today_attendance_logic(date_str):
    """Lấy dữ liệu tổng hợp tháng từ MySQL"""
    # Lấy năm-tháng từ date_str (vận dụng làm tháng báo cáo)
    report_month = date_str[:7] + "-01"
    
    # 1. Lấy dữ liệu từ MySQL
    mysql_conn = get_mysql_connection()
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    
    # Lấy thông tin nhân viên và chấm công từ MySQL
    mysql_cursor.execute("""
        SELECT 
            e.EmployeeID, e.FullName, e.Email, e.PhoneNumber,
            IFNULL(d.DepartmentName, 'Chưa có') as DepartmentName,
            IFNULL(p.PositionName, 'Chưa có') as PositionName,
            e.HireDate, e.DateOfBirth,
            MAX(a.AttendanceID) as AttendanceID, 
            SUM(a.WorkDays) as WorkDays, 
            SUM(a.AbsentDays) as AbsentDays, 
            SUM(a.LeaveDays) as LeaveDays, 
            MAX(a.AttendanceMonth) as AttendanceMonth
        FROM employees_payroll e
        LEFT JOIN departments_payroll d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN positions_payroll p ON e.PositionID = p.PositionID
        LEFT JOIN attendance a ON e.EmployeeID = a.EmployeeID AND a.AttendanceMonth = %s
        GROUP BY 
            e.EmployeeID, e.FullName, e.Email, e.PhoneNumber, 
            DepartmentName, PositionName, e.HireDate, e.DateOfBirth
    """, (report_month,))
    
    results = mysql_cursor.fetchall()
    mysql_conn.close()

    # 3. Hợp nhất dữ liệu
    records = []
    for row in results:
        emp_id = row['EmployeeID']
        
        # Xác định trạng thái dựa trên dữ liệu tháng (giả lập cho view ngày từ dữ liệu tháng)
        # Nếu có ngày công > 0 thì coi như "Có mặt" (để bảng không bị trống)
        status = 'Present'
        if row['AttendanceID']:
            if row['WorkDays'] > 0: status = 'Present'
            elif row['LeaveDays'] > 0: status = 'Leave'
            else: status = 'Absent'
        else:
            status = 'Absent' # Mặc định nếu không có bản ghi chấm công

        records.append({
            'AttendanceID': row['AttendanceID'] or 0,
            'EmployeeID': emp_id,
            'EmployeeCode': f"EMP-{emp_id:05d}",
            'AttendanceDate': date_str,
            'FullName': row['FullName'],
            'Email': row['Email'] or '-',
            'PhoneNumber': row['PhoneNumber'] or '-',
            'DepartmentName': row['DepartmentName'],
            'PositionName': row['PositionName'],
            'Status': status,
            'WorkHours': 8 if status == 'Present' else 0,
            'WorkDays': int(row['WorkDays'] or 0),
            'AbsentDays': int(row['AbsentDays'] or 0),
            'LeaveDays': int(row['LeaveDays'] or 0),
            'TotalOff': int((row['AbsentDays'] or 0) + (row['LeaveDays'] or 0))
        })

    return {
        'success': True,
        'date': date_str,
        'stats': {
            'total': len(records),
            'present': sum(1 for r in records if r['Status'] == 'Present'),
            'absent': sum(1 for r in records if r['Status'] == 'Absent'),
            'leave': sum(1 for r in records if r['Status'] == 'Leave')
        },
        'data': records
    }

def get_all_employees_logic():
    """Lấy danh sách toàn bộ nhân viên từ MySQL"""
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            e.EmployeeID, e.FullName, e.Email, e.PhoneNumber,
            IFNULL(d.DepartmentName, 'Chưa có') as DepartmentName,
            IFNULL(p.PositionName, 'Chưa có') as PositionName,
            e.HireDate, e.DateOfBirth
        FROM employees_payroll e
        LEFT JOIN departments_payroll d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN positions_payroll p ON e.PositionID = p.PositionID
    """)
    employees = [{
        'EmployeeID': r['EmployeeID'], 
        'FullName': r['FullName'], 
        'Email': r['Email'], 
        'PhoneNumber': r['PhoneNumber'],
        'DepartmentName': r['DepartmentName'],
        'PositionName': r['PositionName'],
        'HireDate': str(r['HireDate']) if r['HireDate'] else None,
        'DateOfBirth': str(r['DateOfBirth']) if r['DateOfBirth'] else None
    } for r in cursor.fetchall()]
    conn.close()
    return {'success': True, 'data': employees}

def get_dashboard_stats_logic():
    """Thống kê dashboard dựa trên dữ liệu tháng gần nhất từ MySQL"""
    # 1. Lấy dữ liệu tháng gần nhất và thống kê từ MySQL
    mysql_conn = get_mysql_connection()
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    mysql_cursor.execute("SELECT MAX(AttendanceMonth) as LastMonth FROM attendance")
    last_month = mysql_cursor.fetchone()['LastMonth']
    
    if not last_month:
        # Nếu chưa có dữ liệu chấm công, lấy tổng số nhân viên
        mysql_cursor.execute("SELECT COUNT(*) as total FROM employees_payroll")
        total_emp = mysql_cursor.fetchone()['total']
        mysql_conn.close()
        return {
            'success': True,
            'total_employees': total_emp,
            'today': {'total': 0, 'present': 0, 'absent': 0, 'leave': 0, 'sick': 0},
            'current_month': datetime.now().strftime('%Y-%m')
        }

    mysql_cursor.execute("""
        SELECT 
            COUNT(a.EmployeeID) as TotalRecords,
            SUM(a.WorkDays) as TotalWork,
            SUM(a.AbsentDays) as TotalAbsent,
            SUM(a.LeaveDays) as TotalLeave
        FROM attendance a
        INNER JOIN employees_payroll e ON a.EmployeeID = e.EmployeeID
        WHERE a.AttendanceMonth = %s
    """, (last_month,))
    att_stats = mysql_cursor.fetchone()
    
    # 2. Lấy tổng nhân viên từ MySQL
    mysql_cursor.execute("SELECT COUNT(*) as total FROM employees_payroll")
    total_emp = mysql_cursor.fetchone()['total']
    mysql_conn.close()

    return {
        'success': True,
        'total_employees': total_emp,
        'today': {
            'total': att_stats['TotalRecords'] or 0,
            'present': int(att_stats['TotalWork']) if att_stats['TotalWork'] else 0,
            'absent': int(att_stats['TotalAbsent']) if att_stats['TotalAbsent'] else 0,
            'leave': int(att_stats['TotalLeave']) if att_stats['TotalLeave'] else 0,
            'sick': 0
        },
        'current_month': str(last_month)[:7]
    }

def get_attendance_summary_logic(year_month):
    """Lấy tổng kết chấm công của một tháng cụ thể từ MySQL"""
    report_month = year_month + "-01"
    
    # 1. Lấy dữ liệu từ MySQL
    mysql_conn = get_mysql_connection()
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    
    # Lấy thông tin nhân viên và chấm công từ MySQL
    mysql_cursor.execute("""
        SELECT 
            e.EmployeeID, e.FullName, e.Email, e.PhoneNumber, e.HireDate, e.DateOfBirth, e.Status,
            IFNULL(d.DepartmentName, 'Chưa có') as DepartmentName,
            IFNULL(p.PositionName, 'Chưa có') as PositionName,
            SUM(a.WorkDays) as WorkDays, 
            SUM(a.AbsentDays) as AbsentDays, 
            SUM(a.LeaveDays) as LeaveDays, 
            MAX(a.AttendanceMonth) as AttendanceMonth
        FROM employees_payroll e
        LEFT JOIN departments_payroll d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN positions_payroll p ON e.PositionID = p.PositionID
        LEFT JOIN attendance a ON e.EmployeeID = a.EmployeeID AND a.AttendanceMonth = %s
        GROUP BY 
            e.EmployeeID, e.FullName, e.Email, e.PhoneNumber, e.HireDate, e.DateOfBirth, e.Status,
            DepartmentName, PositionName
    """, (report_month,))
    
    results = mysql_cursor.fetchall()
    mysql_conn.close()

    # 3. Hợp nhất và tính toán thống kê
    data = []
    total_present = 0
    total_absent = 0
    total_leave = 0
    
    for row in results:
        w_days = int(row['WorkDays'] or 0)
        a_days = int(row['AbsentDays'] or 0)
        l_days = int(row['LeaveDays'] or 0)
        
        total_present += w_days
        total_absent += a_days
        total_leave += l_days
        
        data.append({
            'EmployeeID': row['EmployeeID'],
            'FullName': row['FullName'],
            'Email': row.get('Email', '-'),
            'PhoneNumber': row.get('PhoneNumber', '-'),
            'PositionName': row.get('PositionName', '-'),
            'HireDate': str(row.get('HireDate')) if row.get('HireDate') else '-',
            'DateOfBirth': str(row.get('DateOfBirth')) if row.get('DateOfBirth') else '-',
            'DepartmentName': row['DepartmentName'],
            'WorkDays': w_days,
            'PresentDays': w_days,
            'AbsentDays': a_days,
            'LeaveDays': l_days,
            'SickDays': 0,
            'LateDays': 0,
            'TotalLateMinutes': 0,
            'EarlyLeaveDays': 0,
            'TotalEarlyLeaveMinutes': 0,
            'HolidayDays': 0,
            'TotalWorkDays': w_days,
            'AttendanceMonth': str(row['AttendanceMonth']) if row['AttendanceMonth'] else report_month,
            'Status': row.get('Status') or 'Không xác định'
        })
            
    # Giả lập dữ liệu biểu đồ tuần (lấy trung bình từ dữ liệu tháng với một chút biến động)
    import random
    avg_present = total_present / 22 if len(data) > 0 else 0
    weekday_stats = [
        round(avg_present * (1 + random.uniform(-0.1, 0.1)), 1) for _ in range(5)
    ] + [0, 0]
    
    return {
        'success': True, 
        'yearMonth': year_month,
        'data': data,
        'total_stats': {
            'total_present_days': total_present,
            'total_absent_days': total_absent,
            'total_leave_days': total_leave,
            'total_work_days': total_present + total_absent + total_leave,
            'total_work_hours': total_present * 8,
            'total_overtime_hours': 0
        },
        'weekday_stats': weekday_stats
    }

def get_excessive_leave_logic(year, dept_filter, severity_filter, status_filter):
    """Lấy danh sách nhân viên nghỉ nhiều dựa trên cột AbsentDays và LeaveDays từ MySQL"""
    # 1. Lấy dữ liệu từ MySQL (tổng hợp theo năm và join với thông tin nhân viên)
    mysql_conn = get_mysql_connection()
    mysql_cursor = mysql_conn.cursor(dictionary=True)
    mysql_cursor.execute("""
        SELECT 
            e.EmployeeID, e.FullName,
            IFNULL(d.DepartmentName, 'Chưa có') as DepartmentName,
            SUM(a.AbsentDays) as TotalAbsent,
            SUM(a.LeaveDays) as TotalLeave
        FROM employees_payroll e
        LEFT JOIN departments_payroll d ON e.DepartmentID = d.DepartmentID
        JOIN attendance a ON e.EmployeeID = a.EmployeeID
        WHERE YEAR(a.AttendanceMonth) = %s
        GROUP BY e.EmployeeID, e.FullName, d.DepartmentName
        HAVING SUM(a.AbsentDays + a.LeaveDays) > 0
    """, (year,))
    leave_data = mysql_cursor.fetchall()
    mysql_conn.close()

    # 2. Hợp nhất và lọc
    result = []
    limit = 12 # Giả định hạn mức nghỉ phép là 12 ngày/năm
    
    for item in leave_data:
        total_absent = int(item['TotalAbsent'] or 0)
        total_leave_days = int(item['TotalLeave'] or 0)
        total_days = total_absent + total_leave_days
        exceeded = total_days - limit
        
        # Logic phân loại mức độ
        severity = 'High' if exceeded > 8 else 'Medium' if exceeded > 3 else 'Low'
        status = 'Unprocessed' if exceeded > 5 else 'Resolved' # Giả lập trạng thái
        
        # Filter logic
        if dept_filter != 'ALL' and item['DepartmentName'] != dept_filter:
            continue
        if severity_filter != 'ALL' and severity != severity_filter:
            continue
        if status_filter != 'ALL' and status != status_filter:
            continue
            
        result.append({
            'EmployeeID': item['EmployeeID'],
            'FullName': item['FullName'],
            'DepartmentName': item['DepartmentName'],
            'TotalAbsent': total_absent,
            'TotalLeave': total_leave_days,
            'TotalDays': total_days,
            'Limit': limit,
            'Exceeded': exceeded if exceeded > 0 else 0,
            'Severity': severity,
            'Status': 'Unprocessed' if exceeded > 5 else 'Resolved' # Giả lập trạng thái
        })

    # Tính toán thống kê tổng hợp
    stats = {
        'total': len(result),
        'unprocessed': sum(1 for r in result if r['Status'] == 'Unprocessed'),
        'pending': sum(1 for r in result if r['Status'] == 'Pending'),
        'resolved': sum(1 for r in result if r['Status'] == 'Resolved')
    }
    
    # Thống kê theo phòng ban
    dept_stats = {}
    for r in result:
        d = r['DepartmentName']
        dept_stats[d] = dept_stats.get(d, 0) + 1
    
    # Thống kê theo mức độ
    severity_stats = {
        'High': sum(1 for r in result if r['Severity'] == 'High'),
        'Medium': sum(1 for r in result if r['Severity'] == 'Medium'),
        'Low': sum(1 for r in result if r['Severity'] == 'Low')
    }

    return {
        'success': True, 
        'data': result,
        'stats': stats,
        'dept_stats': dept_stats,
        'severity_stats': severity_stats
    }

def get_departments_logic():
    """Lấy danh sách phòng ban từ MySQL"""
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT DepartmentID, DepartmentName 
        FROM departments_payroll 
        ORDER BY DepartmentName
    """)
    
    departments = [{'id': row['DepartmentID'], 'name': row['DepartmentName']} for row in cursor.fetchall()]
    
    conn.close()
    return {'success': True, 'data': departments}

def get_positions_logic():
    """Lấy danh sách chức vụ từ MySQL"""
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT PositionID, PositionName 
        FROM positions_payroll 
        ORDER BY PositionName
    """)
    
    positions = [{'id': row['PositionID'], 'name': row['PositionName']} for row in cursor.fetchall()]
    
    conn.close()
    return {'success': True, 'data': positions}
def get_available_months_logic():
    """Lấy danh sách các tháng có dữ liệu chấm công từ MySQL"""
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT DISTINCT AttendanceMonth 
        FROM attendance 
        ORDER BY AttendanceMonth DESC
    """)
    
    months = []
    for row in cursor.fetchall():
        dt = row['AttendanceMonth']
        if dt:
            val = dt.strftime('%Y-%m')
            label = f"Tháng {dt.month}, {dt.year}"
            months.append({'value': val, 'label': label})
    
    conn.close()
    return {'success': True, 'data': months}

def get_analytics_logic(year):
    """Lấy dữ liệu phân tích xu hướng chấm công theo năm từ MySQL"""
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Thống kê theo từng tháng trong năm
    cursor.execute("""
        SELECT 
            DATE_FORMAT(AttendanceMonth, '%m/%Y') as Month,
            SUM(WorkDays) as TotalWork,
            SUM(AbsentDays) as TotalAbsent,
            SUM(LeaveDays) as TotalLeave
        FROM attendance 
        WHERE YEAR(AttendanceMonth) = %s
        GROUP BY AttendanceMonth
        ORDER BY AttendanceMonth ASC
    """, (year,))
    
    stats = cursor.fetchall()
    
    # Lấy thêm thông tin phòng ban để so sánh
    cursor.execute("""
        SELECT 
            d.DepartmentName,
            SUM(a.WorkDays) as TotalWork,
            SUM(a.AbsentDays) as TotalAbsent
        FROM attendance a
        JOIN employees_payroll e ON a.EmployeeID = e.EmployeeID
        JOIN departments_payroll d ON e.DepartmentID = d.DepartmentID
        WHERE YEAR(a.AttendanceMonth) = %s
        GROUP BY d.DepartmentName
    """, (year,))
    
    dept_stats = cursor.fetchall()
    
    conn.close()
    
    return {
        'success': True,
        'year_trends': stats,
        'department_comparison': dept_stats
    }

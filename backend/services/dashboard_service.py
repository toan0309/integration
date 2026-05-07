from database.db_hr_connector import get_hr_connection
from database.db_payroll_connector import get_payroll_connection
from database.db_auth_connector import get_auth_connection


def get_dashboard_data():
    data = {
        "summary": {
            "totalEmployees": 0,
            "activeEmployees": 0,
            "leaveEmployees": 0,
            "totalDepartments": 0,
            "totalPositions": 0,
            "totalPayroll": 0,
            "totalUsers": 0
        },
        "departmentChart": [],
        "payrollTrend": [
            55000000, 28000000, 35000000, 20000000,
            48000000, 34000000, 61000000, 29000000,
            43000000, 22000000, 69000000, 39000000
        ],
        "recentActivities": [
            "Connected SQL Server HUMAN_2025",
            "Connected MySQL payroll_2026",
            "Connected MySQL auth_db",
            "Loaded dashboard integration data"
        ]
    }

    hr_conn = get_hr_connection()
    hr_cursor = hr_conn.cursor()

    hr_cursor.execute("SELECT COUNT(*) FROM Employees")
    data["summary"]["totalEmployees"] = hr_cursor.fetchone()[0]

    hr_cursor.execute("SELECT COUNT(*) FROM Employees WHERE Status LIKE N'%lam%' OR Status LIKE N'%làm%' OR Status LIKE N'%Đang%'")
    data["summary"]["activeEmployees"] = hr_cursor.fetchone()[0]

    hr_cursor.execute("SELECT COUNT(*) FROM Employees WHERE Status LIKE N'%nghi%' OR Status LIKE N'%nghỉ%'")
    data["summary"]["leaveEmployees"] = hr_cursor.fetchone()[0]

    hr_cursor.execute("SELECT COUNT(*) FROM Departments")
    data["summary"]["totalDepartments"] = hr_cursor.fetchone()[0]

    hr_cursor.execute("SELECT COUNT(*) FROM Positions")
    data["summary"]["totalPositions"] = hr_cursor.fetchone()[0]

    hr_cursor.execute("""
        SELECT 
            d.DepartmentName,
            COUNT(e.EmployeeID) AS TotalEmployees
        FROM Departments d
        LEFT JOIN Employees e ON d.DepartmentID = e.DepartmentID
        GROUP BY d.DepartmentID, d.DepartmentName
        ORDER BY d.DepartmentID
    """)

    rows = hr_cursor.fetchall()

    data["departmentChart"] = [
        {
            "departmentName": str(row.DepartmentName),
            "total": int(row.TotalEmployees)
        }
        for row in rows
    ]

    hr_cursor.close()
    hr_conn.close()

    payroll_conn = get_payroll_connection()
    payroll_cursor = payroll_conn.cursor(dictionary=True)

    payroll_cursor.execute("SELECT COALESCE(SUM(NetSalary), 0) AS totalPayroll FROM salaries")
    payroll_row = payroll_cursor.fetchone()
    data["summary"]["totalPayroll"] = float(payroll_row["totalPayroll"] or 0)

    payroll_cursor.close()
    payroll_conn.close()

    auth_conn = get_auth_connection()
    auth_cursor = auth_conn.cursor(dictionary=True)

    auth_cursor.execute("SELECT COUNT(*) AS totalUsers FROM users")
    auth_row = auth_cursor.fetchone()
    data["summary"]["totalUsers"] = int(auth_row["totalUsers"] or 0)

    auth_cursor.close()
    auth_conn.close()

    return data

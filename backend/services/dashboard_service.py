from database.db_hr_connector import get_hr_connection
from database.db_payroll_connector import get_payroll_connection
from database.db_auth_connector import get_auth_connection


def get_dashboard_data():
    data = {
        "summary": {
            "totalEmployees": 0,
            "totalDepartments": 0,
            "totalPositions": 0,
            "totalPayroll": 0,
            "totalUsers": 0
        },
        "recentActivities": [
            "Connected SQL Server HUMAN_2025",
            "Connected MySQL payroll_2026",
            "Connected MySQL auth_db"
        ]
    }

    # SQL Server HUMAN_2025
    hr_conn = get_hr_connection()
    hr_cursor = hr_conn.cursor()

    hr_cursor.execute("SELECT COUNT(*) FROM Employees")
    data["summary"]["totalEmployees"] = hr_cursor.fetchone()[0]

    hr_cursor.execute("SELECT COUNT(*) FROM Departments")
    data["summary"]["totalDepartments"] = hr_cursor.fetchone()[0]

    hr_cursor.execute("SELECT COUNT(*) FROM Positions")
    data["summary"]["totalPositions"] = hr_cursor.fetchone()[0]

    hr_cursor.close()
    hr_conn.close()

    # MySQL payroll_2026
    payroll_conn = get_payroll_connection()
    payroll_cursor = payroll_conn.cursor(dictionary=True)

    payroll_cursor.execute("SELECT COALESCE(SUM(NetSalary), 0) AS totalPayroll FROM salaries")
    payroll_row = payroll_cursor.fetchone()
    data["summary"]["totalPayroll"] = float(payroll_row["totalPayroll"] or 0)

    payroll_cursor.close()
    payroll_conn.close()

    # MySQL auth_db
    auth_conn = get_auth_connection()
    auth_cursor = auth_conn.cursor(dictionary=True)

    auth_cursor.execute("SELECT COUNT(*) AS totalUsers FROM users")
    auth_row = auth_cursor.fetchone()
    data["summary"]["totalUsers"] = int(auth_row["totalUsers"] or 0)

    auth_cursor.close()
    auth_conn.close()

    return data

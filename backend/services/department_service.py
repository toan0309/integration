from database.db_hr_connector import get_hr_connection


def get_departments():
    conn = get_hr_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            d.DepartmentID,
            d.DepartmentName,
            COUNT(e.EmployeeID) AS TotalEmployees
        FROM Departments d
        LEFT JOIN Employees e ON d.DepartmentID = e.DepartmentID
        GROUP BY d.DepartmentID, d.DepartmentName
        ORDER BY d.DepartmentID
    """)

    rows = cursor.fetchall()

    data = [
        {
            "DepartmentID": row.DepartmentID,
            "DepartmentName": row.DepartmentName,
            "TotalEmployees": int(row.TotalEmployees)
        }
        for row in rows
    ]

    cursor.close()
    conn.close()

    return data
from database.db_hr_connector import get_hr_connection


def get_positions():
    conn = get_hr_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            p.PositionID,
            p.PositionName,
            COUNT(e.EmployeeID) AS TotalEmployees
        FROM Positions p
        LEFT JOIN Employees e ON p.PositionID = e.PositionID
        GROUP BY p.PositionID, p.PositionName
        ORDER BY p.PositionID
    """)

    rows = cursor.fetchall()

    data = [
        {
            "PositionID": row.PositionID,
            "PositionName": row.PositionName,
            "TotalEmployees": int(row.TotalEmployees)
        }
        for row in rows
    ]

    cursor.close()
    conn.close()

    return data
from database.db_hr_connector import get_hr_connection


def get_employees():
    conn = get_hr_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            e.EmployeeID,
            e.FullName,
            e.DateOfBirth,
            e.Gender,
            e.PhoneNumber,
            e.Email,
            e.HireDate,
            e.DepartmentID,
            e.PositionID,
            e.Status,
            d.DepartmentName,
            p.PositionName
        FROM Employees e
        LEFT JOIN Departments d
            ON e.DepartmentID = d.DepartmentID
        LEFT JOIN Positions p
            ON e.PositionID = p.PositionID
        ORDER BY e.EmployeeID
    """)

    rows = cursor.fetchall()

    data = [
        {
            "EmployeeID": row.EmployeeID,
            "FullName": row.FullName,
            "DateOfBirth": str(row.DateOfBirth) if row.DateOfBirth else None,
            "Gender": row.Gender,
            "PhoneNumber": row.PhoneNumber,
            "Email": row.Email,
            "HireDate": str(row.HireDate) if row.HireDate else None,
            "DepartmentID": row.DepartmentID,
            "PositionID": row.PositionID,
            "Status": row.Status,
            "DepartmentName": row.DepartmentName,
            "PositionName": row.PositionName
        }
        for row in rows
    ]

    cursor.close()
    conn.close()

    return data


def add_employee(payload):
    conn = get_hr_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO Employees
        (
            FullName,
            DateOfBirth,
            Gender,
            PhoneNumber,
            Email,
            HireDate,
            DepartmentID,
            PositionID,
            Status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        payload.get("FullName"),
        payload.get("DateOfBirth"),
        payload.get("Gender"),
        payload.get("PhoneNumber"),
        payload.get("Email"),
        payload.get("HireDate"),
        payload.get("DepartmentID"),
        payload.get("PositionID"),
        payload.get("Status", "Đang làm việc")
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return {
        "message": "Employee added successfully"
    }


def update_employee(employee_id, payload):
    conn = get_hr_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE Employees
        SET
            FullName = ?,
            DateOfBirth = ?,
            Gender = ?,
            PhoneNumber = ?,
            Email = ?,
            HireDate = ?,
            DepartmentID = ?,
            PositionID = ?,
            Status = ?,
            UpdatedAt = GETDATE()
        WHERE EmployeeID = ?
    """, (
        payload.get("FullName"),
        payload.get("DateOfBirth"),
        payload.get("Gender"),
        payload.get("PhoneNumber"),
        payload.get("Email"),
        payload.get("HireDate"),
        payload.get("DepartmentID"),
        payload.get("PositionID"),
        payload.get("Status"),
        employee_id
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return {
        "message": "Employee updated successfully"
    }


def delete_employee(employee_id):
    conn = get_hr_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM Employees
        WHERE EmployeeID = ?
    """, (employee_id,))

    conn.commit()

    cursor.close()
    conn.close()

    return {
        "message": "Employee deleted successfully"
    }
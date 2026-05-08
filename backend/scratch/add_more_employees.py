from database.db_payroll_connector import get_mysql_connection
import random

def add_more_employees():
    conn = get_mysql_connection()
    cursor = conn.cursor()
    
    # Names to generate
    first_names = ["Trần", "Lê", "Nguyễn", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ"]
    middle_names = ["Thị", "Văn", "Minh", "Hồng", "Đức", "Thanh", "Quang", "Tú"]
    last_names = ["Anh", "Bình", "Chi", "Dũng", "Em", "Giang", "Hương", "Khanh", "Linh", "Mai", "Nam", "Oanh", "Phúc", "Quân", "Sơn", "Thảo", "Uyên", "Vinh"]
    
    # Get departments and positions
    cursor.execute("SELECT DepartmentID FROM departments_payroll")
    dept_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT PositionID FROM positions_payroll")
    pos_ids = [r[0] for r in cursor.fetchall()]
    
    # Get current max ID
    cursor.execute("SELECT MAX(EmployeeID) FROM employees_payroll")
    max_id = cursor.fetchone()[0] or 0
    
    new_emps_count = 10
    for i in range(new_emps_count):
        max_id += 1
        full_name = f"{random.choice(first_names)} {random.choice(middle_names)} {random.choice(last_names)}"
        email = f"{full_name.lower().replace(' ', '.')}@company.com"
        phone = f"09{random.randint(10000000, 99999999)}"
        dept_id = random.choice(dept_ids)
        pos_id = random.choice(pos_ids)
        hire_date = f"{random.randint(2015, 2023)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
        dob = f"{random.randint(1980, 2000)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}"
        
        cursor.execute("""
            INSERT INTO employees_payroll (EmployeeID, FullName, Email, PhoneNumber, DepartmentID, PositionID, HireDate, DateOfBirth, Status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Active')
        """, (max_id, full_name, email, phone, dept_id, pos_id, hire_date, dob))
        
    conn.commit()
    print(f"Added {new_emps_count} new employees starting from ID {max_id - 9}")
    
    # Now add attendance for them
    cursor.execute(f"SELECT EmployeeID FROM employees_payroll WHERE EmployeeID > {max_id - 10}")
    new_ids = [r[0] for r in cursor.fetchall()]
    
    months = ['2024-09-01', '2026-04-01', '2026-05-01']
    for month in months:
        for eid in new_ids:
            wd = random.randint(15, 22)
            ad = random.randint(0, 5)
            ld = random.randint(0, 3)
            cursor.execute("INSERT IGNORE INTO attendance (EmployeeID, WorkDays, AbsentDays, LeaveDays, AttendanceMonth) VALUES (%s, %s, %s, %s, %s)", (eid, wd, ad, ld, month))
    
    conn.commit()
    print(f"Added attendance data for new employees for {len(months)} months")
    conn.close()

if __name__ == "__main__":
    add_more_employees()

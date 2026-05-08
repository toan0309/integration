from database.db_payroll_connector import get_mysql_connection
import random

def add_mock_data():
    conn = get_mysql_connection()
    cursor = conn.cursor()
    
    # Get all employee IDs
    cursor.execute('SELECT EmployeeID FROM employees_payroll')
    employees = [row[0] for row in cursor.fetchall()]
    
    months = ['2026-04-01', '2026-05-01']
    
    for month in months:
        count = 0
        for emp_id in employees:
            work_days = random.randint(18, 22)
            absent_days = random.randint(0, 3)
            leave_days = random.randint(0, 2)
            
            try:
                cursor.execute("""
                    INSERT INTO attendance (EmployeeID, WorkDays, AbsentDays, LeaveDays, AttendanceMonth)
                    VALUES (%s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE 
                        WorkDays = VALUES(WorkDays),
                        AbsentDays = VALUES(AbsentDays),
                        LeaveDays = VALUES(LeaveDays)
                """, (emp_id, work_days, absent_days, leave_days, month))
                count += 1
            except Exception as e:
                print(f"Error inserting for {emp_id} in {month}: {e}")
        
        conn.commit()
        print(f"Successfully added/updated data for {count} employees in {month}")
    
    conn.close()

if __name__ == "__main__":
    add_mock_data()

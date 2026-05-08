import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv('DB_HOST', 'localhost')
user = os.getenv('DB_USER', 'root')
password = os.getenv('DB_PASSWORD', '')
database = os.getenv('DB_NAME', 'auth_db')
port = int(os.getenv('DB_PORT', 3306))

try:
    print(f"Connecting to MySQL: {user}@{host}:{port}/{database}")
    conn = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port
    )
    cursor = conn.cursor(dictionary=True)
    
    tables = ['users', 'roles', 'password_resets']
    
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
            count = cursor.fetchone()['count']
            print(f"Table '{table}' has {count} rows.")
            
            if count > 0:
                cursor.execute(f"SELECT * FROM {table} LIMIT 2")
                rows = cursor.fetchall()
                print(f"--- Top 2 rows in {table} ---")
                for row in rows:
                    # Filter out non-ascii to avoid terminal print errors
                    safe_row = {k: str(v).encode('ascii', 'ignore').decode('ascii') if isinstance(v, str) else v for k, v in row.items()}
                    print(safe_row)
                print("--------------------------------")
        except Exception as e:
            print(f"Error querying table '{table}': {e}")
            
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")

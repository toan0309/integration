from flask import Flask
from flask_cors import CORS

from routes.dashboard_routes import dashboard_bp
from database.sql_server import get_sql_connection
from database.mysql_db import get_payroll_connection, get_auth_connection

app = Flask(__name__)
CORS(app)

app.register_blueprint(dashboard_bp)

@app.route("/")
def home():
    return {"message": "Backend running successfully"}

@app.route("/api/test-db")
def test_db():
    results = {
        "sql_server_human_2025": "Failed",
        "mysql_payroll_2026": "Failed",
        "mysql_auth_db": "Failed"
    }
    
    # Test SQL Server
    try:
        conn = get_sql_connection()
        if conn:
            results["sql_server_human_2025"] = "Success"
            conn.close()
    except Exception as e:
        results["sql_server_human_2025"] = f"Failed: {str(e)}"
        
    # Test MySQL Payroll
    try:
        conn = get_payroll_connection()
        if conn:
            results["mysql_payroll_2026"] = "Success"
            conn.close()
    except Exception as e:
        results["mysql_payroll_2026"] = f"Failed: {str(e)}"
        
    # Test MySQL Auth
    try:
        conn = get_auth_connection()
        if conn:
            results["mysql_auth_db"] = "Success"
            conn.close()
    except Exception as e:
        results["mysql_auth_db"] = f"Failed: {str(e)}"
        
    return results

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)

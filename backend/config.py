import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))

    SQL_SERVER = os.getenv("SQL_SERVER", "localhost")
    SQL_DATABASE = os.getenv("SQL_DATABASE", "HUMAN_2025")

    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "payroll_2026")

    AUTH_MYSQL_HOST = os.getenv("AUTH_MYSQL_HOST", "localhost")
    AUTH_MYSQL_USER = os.getenv("AUTH_MYSQL_USER", "root")
    AUTH_MYSQL_PASSWORD = os.getenv("AUTH_MYSQL_PASSWORD", "")
    AUTH_MYSQL_DATABASE = os.getenv("AUTH_MYSQL_DATABASE", "auth_db")

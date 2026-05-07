import mysql.connector
from config import Config

def get_auth_connection():
    return mysql.connector.connect(
        host=Config.AUTH_MYSQL_HOST,
        user=Config.AUTH_MYSQL_USER,
        password=Config.AUTH_MYSQL_PASSWORD,
        database=Config.AUTH_MYSQL_DATABASE
    )

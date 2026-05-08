import mysql.connector
from mysql.connector import Error, IntegrityError
import os
from typing import Optional, List, Dict, Tuple
from dotenv import load_dotenv

load_dotenv()

class AuthDatabaseConnector:
    """Handle authentication database operations for MySQL"""
    
    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.user = os.getenv('DB_USER', 'root')
        self.password = os.getenv('DB_PASSWORD', '')
        self.database = os.getenv('DB_NAME', 'auth_db')
        self.port = int(os.getenv('DB_PORT', 3306))
    
    def get_connection(self):
        try:
            return mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port,
                use_pure=True
            )
        except Error as e:
            raise Exception(f"Database connection failed: {e}")
    
    # ---- User operations ----
    def create_user(self, email: str, full_name: str, password_hash: str, phone: str = None, 
                   employee_id: int = None) -> Tuple[bool, Optional[int], str]:
        # phone and employee_id are ignored since they are not in the MySQL schema
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            # Default role_id = 3 (employee)
            # Username is required in the DB, so we use email as username
            cursor.execute("""
                INSERT INTO users (username, email, full_name, password_hash, role_id, is_active)
                VALUES (%s, %s, %s, %s, 3, 1)
            """, (email, email, full_name, password_hash))
            conn.commit()
            user_id = cursor.lastrowid
            cursor.close(); conn.close()
            return True, user_id, "User created successfully"
        except IntegrityError as e:
            return False, None, f"User already exists: {e}"
        except Error as e:
            return False, None, f"Error creating user: {e}"
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            # Mapping schema columns to the expected format
            cursor.execute("""
                SELECT user_id, email, full_name, password_hash, role_id, 
                       is_active, last_login, created_at
                FROM users WHERE email = %s OR username = %s
            """, (email, email))
            row = cursor.fetchone()
            cursor.close(); conn.close()
            return row
        except Error as e:
            raise Exception(f"Error fetching user: {e}")
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT user_id, email, full_name, password_hash, role_id, 
                       is_active, last_login, created_at
                FROM users WHERE user_id = %s
            """, (user_id,))
            row = cursor.fetchone()
            cursor.close(); conn.close()
            return row
        except Error as e:
            raise Exception(f"Error fetching user: {e}")
    
    def list_users(self, page: int = 1, per_page: int = 10, search: str = None) -> Tuple[List[Dict], int]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            offset = (page - 1) * per_page
            
            if search:
                where = "WHERE (email LIKE %s OR full_name LIKE %s)"
                params_search = (f'%{search}%', f'%{search}%')
            else:
                where = ""
                params_search = ()
            
            cursor.execute(f"SELECT COUNT(*) as count FROM users {where}", params_search)
            total = cursor.fetchone()['count']
            
            cursor.execute(f"""
                SELECT user_id, email, full_name, role_id, is_active, last_login, created_at
                FROM users {where}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """, (*params_search, per_page, offset))
            
            users = cursor.fetchall()
            cursor.close(); conn.close()
            return users, total
        except Error as e:
            raise Exception(f"Error listing users: {e}")
    
    def update_user(self, user_id: int, full_name: str = None, phone: str = None, 
                   employee_id: int = None) -> Tuple[bool, str]:
        # phone and employee_id ignored
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            updates = []
            params = []
            if full_name is not None:
                updates.append("full_name = %s")
                params.append(full_name)
            
            if not updates:
                return False, "No fields to update"
            
            params.append(user_id)
            cursor.execute(f"""
                UPDATE users SET {', '.join(updates)}
                WHERE user_id = %s
            """, tuple(params))
            conn.commit()
            cursor.close(); conn.close()
            return True, "User updated successfully"
        except Error as e:
            return False, f"Error updating user: {e}"
    
    def update_user_profile(self, user_id: int, full_name: str = None, phone: str = None) -> Tuple[bool, str]:
        return self.update_user(user_id, full_name=full_name)
    
    def update_user_password(self, user_id: int, new_password_hash: str) -> Tuple[bool, str]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE users 
                SET password_hash = %s
                WHERE user_id = %s
            """, (new_password_hash, user_id))
            conn.commit()
            cursor.close(); conn.close()
            return True, "Password updated successfully"
        except Error as e:
            return False, f"Error updating password: {e}"
    
    def update_last_login(self, user_id: int) -> bool:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET last_login = NOW() WHERE user_id = %s", (user_id,))
            conn.commit()
            cursor.close(); conn.close()
            return True
        except Error:
            return False
    
    def disable_user(self, user_id: int) -> Tuple[bool, str]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET is_active = 0 WHERE user_id = %s", (user_id,))
            conn.commit()
            cursor.close(); conn.close()
            return True, "User disabled successfully"
        except Error as e:
            return False, f"Error disabling user: {e}"
    
    def enable_user(self, user_id: int) -> Tuple[bool, str]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET is_active = 1 WHERE user_id = %s", (user_id,))
            conn.commit()
            cursor.close(); conn.close()
            return True, "User enabled successfully"
        except Error as e:
            return False, f"Error enabling user: {e}"
    
    # ---- Role operations ----
    def add_user_role(self, user_id: int, role_id: int) -> Tuple[bool, str]:
        # Since MySQL schema only has a role_id column in users table
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE users SET role_id = %s WHERE user_id = %s
            """, (role_id, user_id))
            conn.commit()
            cursor.close(); conn.close()
            return True, "Role assigned successfully"
        except Error as e:
            return False, f"Error assigning role: {e}"
    
    def remove_user_role(self, user_id: int, role_id: int) -> Tuple[bool, str]:
        # Since user can only have one role, removing it just sets it to NULL or default. 
        # Assuming role_id cannot be null, we might set it to a guest role or fail.
        # But wait, we can just leave it as is or set to 0. 
        # Wait, the `role_id` column in users is NOT NULL. 
        return False, "Cannot remove the primary role, assign a different role instead."
    
    def get_user_roles(self, user_id: int) -> List[Dict]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT r.role_id, r.role_name, r.description
                FROM roles r
                INNER JOIN users u ON r.role_id = u.role_id
                WHERE u.user_id = %s
            """, (user_id,))
            rows = cursor.fetchall()
            cursor.close(); conn.close()
            return rows
        except Error as e:
            raise Exception(f"Error fetching user roles: {e}")
    
    def create_role(self, role_name: str, description: str = None) -> Tuple[bool, Optional[int], str]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO roles (role_name, description, created_at)
                VALUES (%s, %s, NOW())
            """, (role_name, description))
            conn.commit()
            role_id = cursor.lastrowid
            cursor.close(); conn.close()
            return True, role_id, "Role created successfully"
        except Error as e:
            return False, None, f"Error creating role: {e}"
    
    def get_role_by_id(self, role_id: int) -> Optional[Dict]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT role_id, role_name, description, created_at FROM roles WHERE role_id = %s", (role_id,))
            row = cursor.fetchone()
            cursor.close(); conn.close()
            return row
        except Error as e:
            raise Exception(f"Error fetching role: {e}")
    
    def update_role(self, role_id: int, role_name: str = None, description: str = None) -> Tuple[bool, str]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            updates = []
            params = []
            if role_name is not None:
                updates.append("role_name = %s")
                params.append(role_name)
            if description is not None:
                updates.append("description = %s")
                params.append(description)
            if not updates:
                return False, "No fields to update"
            params.append(role_id)
            cursor.execute(f"UPDATE roles SET {', '.join(updates)} WHERE role_id = %s", tuple(params))
            conn.commit()
            cursor.close(); conn.close()
            return True, "Role updated successfully"
        except Error as e:
            return False, f"Error updating role: {e}"
    
    def delete_role(self, role_id: int) -> Tuple[bool, str]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role_id = %s", (role_id,))
            count = cursor.fetchone()['count']
            if count > 0:
                cursor.close(); conn.close()
                return False, f"Cannot delete: {count} user(s) have this role"
            cursor.execute("DELETE FROM roles WHERE role_id = %s", (role_id,))
            conn.commit()
            cursor.close(); conn.close()
            return True, "Role deleted successfully"
        except Error as e:
            return False, f"Error deleting role: {e}"
    
    # ---- Password reset operations ----
    def create_reset_token(self, user_id: int, token: str, expires_at) -> Tuple[bool, str]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO password_resets (user_id, token, expires_at, created_at, is_used)
                VALUES (%s, %s, %s, NOW(), 0)
            """, (user_id, token, expires_at))
            conn.commit()
            cursor.close(); conn.close()
            return True, "Reset token created"
        except Error as e:
            return False, f"Error creating reset token: {e}"
    
    def get_reset_token(self, token: str) -> Optional[Dict]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT reset_id, user_id, token, expires_at, is_used, created_at
                FROM password_resets
                WHERE token = %s AND is_used = 0 AND expires_at > NOW()
            """, (token,))
            row = cursor.fetchone()
            cursor.close(); conn.close()
            return row
        except Error as e:
            raise Exception(f"Error fetching reset token: {e}")
    
    def mark_reset_token_used(self, reset_id: int) -> Tuple[bool, str]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE password_resets SET is_used = 1, used_at = NOW()
                WHERE reset_id = %s
            """, (reset_id,))
            conn.commit()
            cursor.close(); conn.close()
            return True, "Token marked as used"
        except Error as e:
            return False, f"Error marking token: {e}"

auth_db = AuthDatabaseConnector()

import pyodbc
import os
from typing import Optional, List, Dict, Tuple

class AuthDatabaseConnector:
    """Handle authentication database operations"""
    
    def __init__(self):
        self.conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={os.getenv('SQL_SERVER', 'localhost')};"
            f"DATABASE={os.getenv('AUTH_DATABASE', 'AuthDB')};"
            "Trusted_Connection=yes;"
            "TrustServerCertificate=yes;"
        )
    
    def get_connection(self):
        """Create and return a database connection"""
        try:
            return pyodbc.connect(self.conn_str)
        except Exception as e:
            raise Exception(f"Database connection failed: {str(e)}")
    
    # User operations
    def create_user(self, email: str, full_name: str, password_hash: str, phone: str = None, 
                   employee_id: int = None) -> Tuple[bool, Optional[int], str]:
        """
        Create a new user
        
        Returns:
            Tuple of (success, user_id, message)
        """
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO Users (email, full_name, password_hash, phone, employee_id, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, 1, GETDATE())
            """, (email, full_name, password_hash, phone, employee_id))
            
            conn.commit()
            
            # Get the inserted user ID
            cursor.execute("SELECT @@IDENTITY as user_id")
            user_id = cursor.fetchone()[0]
            
            cursor.close()
            conn.close()
            
            return True, user_id, "User created successfully"
        except pyodbc.IntegrityError as e:
            return False, None, f"User already exists: {str(e)}"
        except Exception as e:
            return False, None, f"Error creating user: {str(e)}"
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT user_id, email, full_name, password_hash, phone, employee_id, 
                       is_active, last_login, created_at
                FROM Users
                WHERE email = ?
            """, (email,))
            
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if row:
                columns = [description[0] for description in cursor.description]
                return dict(zip(columns, row))
            return None
        except Exception as e:
            raise Exception(f"Error fetching user: {str(e)}")
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT user_id, email, full_name, password_hash, phone, employee_id, 
                       is_active, last_login, created_at
                FROM Users
                WHERE user_id = ? AND is_active = 1
            """, (user_id,))
            
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if row:
                columns = [description[0] for description in cursor.description]
                return dict(zip(columns, row))
            return None
        except Exception as e:
            raise Exception(f"Error fetching user: {str(e)}")
    
    def update_user_password(self, user_id: int, new_password_hash: str) -> Tuple[bool, str]:
        """Update user password"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE Users 
                SET password_hash = ?, password_changed_at = GETDATE()
                WHERE user_id = ?
            """, (new_password_hash, user_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, "Password updated successfully"
        except Exception as e:
            return False, f"Error updating password: {str(e)}"
    
    def update_last_login(self, user_id: int) -> bool:
        """Update user last login timestamp"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE Users 
                SET last_login = GETDATE()
                WHERE user_id = ?
            """, (user_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
        except Exception as e:
            return False
    
    def disable_user(self, user_id: int) -> Tuple[bool, str]:
        """Disable a user account"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE Users 
                SET is_active = 0
                WHERE user_id = ?
            """, (user_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, "User disabled successfully"
        except Exception as e:
            return False, f"Error disabling user: {str(e)}"
    
    def enable_user(self, user_id: int) -> Tuple[bool, str]:
        """Enable a user account"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE Users 
                SET is_active = 1
                WHERE user_id = ?
            """, (user_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, "User enabled successfully"
        except Exception as e:
            return False, f"Error enabling user: {str(e)}"
    
    # Role operations
    def add_user_role(self, user_id: int, role_id: int) -> Tuple[bool, str]:
        """Add a role to a user"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO UserRoles (user_id, role_id, assigned_at)
                VALUES (?, ?, GETDATE())
            """, (user_id, role_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, "Role assigned successfully"
        except pyodbc.IntegrityError:
            return False, "User already has this role"
        except Exception as e:
            return False, f"Error assigning role: {str(e)}"
    
    def remove_user_role(self, user_id: int, role_id: int) -> Tuple[bool, str]:
        """Remove a role from a user"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                DELETE FROM UserRoles
                WHERE user_id = ? AND role_id = ?
            """, (user_id, role_id))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, "Role removed successfully"
        except Exception as e:
            return False, f"Error removing role: {str(e)}"
    
    def get_user_roles(self, user_id: int) -> List[Dict]:
        """Get all roles for a user"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT r.role_id, r.role_name, r.description
                FROM Roles r
                INNER JOIN UserRoles ur ON r.role_id = ur.role_id
                WHERE ur.user_id = ?
            """, (user_id,))
            
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            
            result = []
            for row in rows:
                result.append({
                    'role_id': row[0],
                    'role_name': row[1],
                    'description': row[2]
                })
            return result
        except Exception as e:
            raise Exception(f"Error fetching user roles: {str(e)}")
    
    def create_role(self, role_name: str, description: str = None) -> Tuple[bool, Optional[int], str]:
        """Create a new role"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO Roles (role_name, description, created_at)
                VALUES (?, ?, GETDATE())
            """, (role_name, description))
            
            conn.commit()
            cursor.execute("SELECT @@IDENTITY as role_id")
            role_id = cursor.fetchone()[0]
            
            cursor.close()
            conn.close()
            
            return True, role_id, "Role created successfully"
        except Exception as e:
            return False, None, f"Error creating role: {str(e)}"
    
    # Password reset operations
    def create_reset_token(self, user_id: int, token: str, expires_at: str) -> Tuple[bool, str]:
        """Create a password reset token"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO PasswordResets (user_id, token, expires_at, created_at, is_used)
                VALUES (?, ?, ?, GETDATE(), 0)
            """, (user_id, token, expires_at))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, "Reset token created"
        except Exception as e:
            return False, f"Error creating reset token: {str(e)}"
    
    def get_reset_token(self, token: str) -> Optional[Dict]:
        """Get password reset token details"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT reset_id, user_id, token, expires_at, is_used, created_at
                FROM PasswordResets
                WHERE token = ? AND is_used = 0 AND expires_at > GETDATE()
            """, (token,))
            
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if row:
                return {
                    'reset_id': row[0],
                    'user_id': row[1],
                    'token': row[2],
                    'expires_at': row[3],
                    'is_used': row[4],
                    'created_at': row[5]
                }
            return None
        except Exception as e:
            raise Exception(f"Error fetching reset token: {str(e)}")
    
    def mark_reset_token_used(self, reset_id: int) -> Tuple[bool, str]:
        """Mark a reset token as used"""
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE PasswordResets
                SET is_used = 1, used_at = GETDATE()
                WHERE reset_id = ?
            """, (reset_id,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True, "Token marked as used"
        except Exception as e:
            return False, f"Error marking token: {str(e)}"


auth_db = AuthDatabaseConnector()

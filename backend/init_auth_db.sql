USE auth_db;
GO

-- 2. Tạo bảng Roles
CREATE TABLE Roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 3. Tạo bảng Users
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(100) NOT NULL UNIQUE,
    full_name NVARCHAR(100) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    employee_id INT,
    is_active BIT DEFAULT 1,
    last_login DATETIME,
    password_changed_at DATETIME,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 4. Tạo bảng UserRoles (Mapping N-N giữa Users và Roles)
CREATE TABLE UserRoles (
    user_id INT FOREIGN KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    role_id INT FOREIGN KEY REFERENCES Roles(role_id) ON DELETE CASCADE,
    assigned_at DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (user_id, role_id)
);
GO

-- 5. Tạo bảng PasswordResets (Cho chức năng Quên mật khẩu)
CREATE TABLE PasswordResets (
    reset_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    token NVARCHAR(255) NOT NULL,
    is_used BIT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 6. Insert dữ liệu Roles mặc định
INSERT INTO Roles (role_name, description) VALUES 
('admin', 'Administrator with full system access'),
('hr', 'Human Resources manager'),
('employee', 'Regular employee access');
GO

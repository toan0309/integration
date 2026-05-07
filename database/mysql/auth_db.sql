-- ======================================================
-- Database: AUTH_DB
-- Description: Xác thực và phân quyền cho Dashboard
-- ======================================================

CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

-- ======================================================
-- Table: users
-- Description: Lưu thông tin người dùng
-- ======================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `user_id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `full_name` NVARCHAR(100),
    `role_id` INT NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `last_login` DATETIME NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- Table: roles
-- Description: Lưu danh sách vai trò
-- ======================================================
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `role_id` INT NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- Table: permissions
-- Description: Lưu danh sách quyền
-- ======================================================
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
    `permission_id` INT NOT NULL AUTO_INCREMENT,
    `resource` VARCHAR(100) NOT NULL,
    `action` VARCHAR(20) NOT NULL,
    `description` VARCHAR(255),
    PRIMARY KEY (`permission_id`),
    UNIQUE KEY `uk_resource_action` (`resource`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- Table: role_permissions
-- Description: Liên kết vai trò với quyền (N-N)
-- ======================================================
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
    `role_id` INT NOT NULL,
    `permission_id` INT NOT NULL,
    `granted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`role_id`, `permission_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- Table: audit_logs
-- Description: Lưu nhật ký hoạt động của người dùng
-- ======================================================
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `log_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NULL,
    `username` VARCHAR(50) NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource` VARCHAR(100),
    `resource_id` VARCHAR(50),
    `old_value` JSON,
    `new_value` JSON,
    `ip_address` VARCHAR(45),
    `user_agent` TEXT,
    `status` VARCHAR(20),
    `error_message` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`log_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_action` (`action`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- Table: refresh_tokens
-- Description: Lưu refresh token để cấp mới access token
-- ======================================================
DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
    `token_id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `token` VARCHAR(500) NOT NULL UNIQUE,
    `expires_at` DATETIME NOT NULL,
    `is_revoked` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`token_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    INDEX `idx_token` (`token`),
    INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================================
-- INSERT INITIAL DATA
-- ======================================================

-- Insert roles
INSERT INTO `roles` (`role_name`, `description`) VALUES
('Admin', 'Toàn quyền truy cập, quản lý người dùng và hệ thống'),
('HR Manager', 'Quản lý nhân viên, phòng ban, chức vụ, cổ tức'),
('Payroll Manager', 'Quản lý lương, chấm công, báo cáo lương'),
('Employee', 'Chỉ xem thông tin của chính mình');

-- Insert permissions (resources: employees, departments, positions, payroll, attendance, reports, dividends, users, alerts)
INSERT INTO `permissions` (`resource`, `action`, `description`) VALUES
-- Employees
('employees', 'create', 'Thêm nhân viên mới'),
('employees', 'read', 'Xem danh sách nhân viên'),
('employees', 'update', 'Cập nhật thông tin nhân viên'),
('employees', 'delete', 'Xóa nhân viên'),
-- Departments
('departments', 'create', 'Thêm phòng ban mới'),
('departments', 'read', 'Xem danh sách phòng ban'),
('departments', 'update', 'Cập nhật phòng ban'),
('departments', 'delete', 'Xóa phòng ban'),
-- Positions
('positions', 'create', 'Thêm chức vụ mới'),
('positions', 'read', 'Xem danh sách chức vụ'),
('positions', 'update', 'Cập nhật chức vụ'),
('positions', 'delete', 'Xóa chức vụ'),
-- Payroll
('payroll', 'create', 'Thêm bảng lương'),
('payroll', 'read', 'Xem bảng lương'),
('payroll', 'update', 'Cập nhật bảng lương'),
('payroll', 'delete', 'Xóa bảng lương'),
-- Attendance
('attendance', 'create', 'Thêm chấm công'),
('attendance', 'read', 'Xem chấm công'),
('attendance', 'update', 'Cập nhật chấm công'),
('attendance', 'delete', 'Xóa chấm công'),
-- Reports
('reports', 'read', 'Xem báo cáo'),
-- Dividends
('dividends', 'read', 'Xem cổ tức'),
-- Users (chỉ Admin)
('users', 'create', 'Tạo người dùng'),
('users', 'read', 'Xem danh sách người dùng'),
('users', 'update', 'Cập nhật người dùng'),
('users', 'delete', 'Xóa người dùng'),
-- Alerts
('alerts', 'read', 'Xem cảnh báo');

-- Assign permissions to roles

-- Admin: tất cả quyền
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, permission_id FROM `permissions`;

-- HR Manager: employees (CRUD), departments (CRUD), positions (CRUD), reports (read), dividends (read), alerts (read)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(2, 2), (2, 3), (2, 4),  -- employees: read, update, delete (không create vì HR không tạo nhân viên mới? thực tế HR có thể tạo)
(2, 6), (2, 7), (2, 8),  -- departments: read, update, delete
(2, 10), (2, 11), (2, 12), -- positions: read, update, delete
(2, 18), -- reports: read
(2, 19), -- dividends: read
(2, 23); -- alerts: read

-- Payroll Manager: employees (read), payroll (CRUD), attendance (CRUD), reports (read), alerts (read)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(3, 2), -- employees: read
(3, 13), (3, 14), (3, 15), (3, 16), -- payroll: full CRUD
(3, 17), (3, 18), (3, 19), (3, 20), -- attendance: full CRUD
(3, 21), -- reports: read
(3, 23); -- alerts: read

-- Employee: chỉ xem chính mình (sẽ được lọc trong code, không cần permission chi tiết)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(4, 2); -- employees: read (chỉ xem mình)

-- Insert default users (password: "password123" đã được hash bằng bcrypt)
-- Hash của "password123" (thay bằng hash thực tế khi deploy)
INSERT INTO `users` (`username`, `password_hash`, `email`, `full_name`, `role_id`, `is_active`) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrLp4HxQKcO', 'admin@companyx.com', 'Quản trị viên', 1, TRUE),
('hr_manager', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrLp4HxQKcO', 'hr@companyx.com', 'Trưởng phòng Nhân sự', 2, TRUE),
('payroll_manager', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrLp4HxQKcO', 'payroll@companyx.com', 'Trưởng phòng Lương', 3, TRUE),
('employee_01', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYrLp4HxQKcO', 'employee01@companyx.com', 'Nguyễn Văn An', 4, TRUE);

-- ======================================================
-- VIEWS for easier querying
-- ======================================================

-- View: user_permissions (lấy tất cả quyền của user)
DROP VIEW IF EXISTS `user_permissions`;
CREATE VIEW `user_permissions` AS
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    r.role_name,
    p.resource,
    p.action
FROM users u
JOIN roles r ON u.role_id = r.role_id
JOIN role_permissions rp ON r.role_id = rp.role_id
JOIN permissions p ON rp.permission_id = p.permission_id;

-- ======================================================
-- End of file
-- ======================================================
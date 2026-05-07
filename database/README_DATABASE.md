# Database Setup

## SQL Server Database

Database name:

HUMAN_2025

File:

database/sql_server/HUMAN_2025.bak

Restore by SSMS:

1. Open SQL Server Management Studio
2. Right click Databases
3. Choose Restore Database
4. Choose Device
5. Add HUMAN_2025.bak
6. Restore as HUMAN_2025
7. Use Windows Authentication

## MySQL Databases

Database names:

payroll_2026
auth_db

Files:

database/mysql/payroll_2026.sql
database/mysql/auth_db.sql

Import by Navicat:

1. Create database payroll_2026
2. Run payroll_2026.sql
3. Create database auth_db
4. Run auth_db.sql

Default MySQL account:

MYSQL_USER=root
MYSQL_PASSWORD=03092005

## Backend .env

Use backend/.env.example and copy it to backend/.env

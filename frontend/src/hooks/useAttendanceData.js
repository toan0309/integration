import { useEffect, useMemo, useState } from 'react';
import { formatTime, formatDate, normalizeStatus } from '../utils/helpers';

// ─── Hằng số ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const TODAY_PAGE_SIZE = 5;

// ─── Custom Hook: quản lý toàn bộ dữ liệu chấm công ───────────────────────
export function useAttendanceData() {
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [todayRows, setTodayRows] = useState([]);
  const [summary, setSummary] = useState({
    totalWorkDays: 0,
    averageAttendance: '0%',
    totalWorkHours: '0h',
    totalOvertimeHours: '0h',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reportRows, setReportRows] = useState([]);
  const [reportMeta, setReportMeta] = useState({
    yearMonth: '',
    totalStats: null,
    weekdayStats: [0, 0, 0, 0, 0, 0, 0],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [todayPage, setTodayPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);

  // ─── URL API ──────────────────────────────────────────────────────────────
  const apiUrl = useMemo(() => {
    if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000`;
  }, []);

  // ─── Fetch Available Months ───────────────────────────────────────────────
  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/attendance/available-months`);
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && Array.isArray(payload.data)) {
            setAvailableMonths(payload.data);
            if (payload.data.length > 0) {
              const latest = payload.data[0].value;
              setSelectedMonth(latest);
              setSelectedDate(`${latest}-01`);
            } else {
              // Fallback to current month if DB is empty
              const now = new Date();
              const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
              setSelectedMonth(currentYm);
              setSelectedDate(`${currentYm}-01`);
              setAvailableMonths([{ value: currentYm, label: `Tháng ${now.getMonth() + 1}, ${now.getFullYear()}` }]);
            }
          }
        }
      } catch (err) {
        console.error('Loi tai danh sach thang:', err);
      }
    };
    fetchMonths();
  }, [apiUrl]);

  // ─── Điều hướng tháng ─────────────────────────────────────────────────────
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(ym);
    setSelectedDate(`${ym}-01`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(ym);
    setSelectedDate(`${ym}-01`);
  };

  // ─── Fetch dữ liệu từ API ─────────────────────────────────────────────────
  useEffect(() => {
    // Chỉ fetch nếu có selectedMonth
    if (!selectedMonth) return;

    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        const [employeesRes, attendanceRes, summaryRes] = await Promise.all([
          fetch(`${apiUrl}/api/attendance/employees`),
          fetch(`${apiUrl}/api/attendance/today?date=${selectedDate}`),
          fetch(`${apiUrl}/api/attendance/summary?yearMonth=${selectedMonth}`),
        ]);

        if (!employeesRes.ok) throw new Error('Khong the tai danh sach nhan vien');
        if (!attendanceRes.ok) throw new Error('Khong the tai du lieu cham cong hom nay');

        const employeesPayload = await employeesRes.json();
        const attendancePayload = await attendanceRes.json();
        const summaryPayload = summaryRes.ok ? await summaryRes.json() : { data: [] };

        const employees = Array.isArray(employeesPayload.data) ? employeesPayload.data : [];
        const attendance = Array.isArray(attendancePayload.data) ? attendancePayload.data : [];
        const summaryRowsData = Array.isArray(summaryPayload.data) ? summaryPayload.data : [];

        const attendanceByEmployeeId = new Map(
          attendance.map((item) => [String(item.EmployeeID), item])
        );

        const mergedAttendanceRows = employees.map((emp) => {
          const att = attendanceByEmployeeId.get(String(emp.EmployeeID));
          return {
            employeeId: String(emp.EmployeeID),
            code: `EMP-${String(emp.EmployeeID).padStart(5, '0')}`,
            name: emp.FullName || '',
            phone: emp.PhoneNumber || '-',
            department: emp.DepartmentName || '',
            position: emp.PositionName || '',
            joinDate: formatDate(emp.HireDate || att?.HireDate),
            birthDate: formatDate(emp.DateOfBirth || att?.DateOfBirth),
            location: 'TP.HCM',
            status: normalizeStatus(att?.Status),
            email: emp.Email || '-',
          };
        });

        const todayData = mergedAttendanceRows.map((row) => {
          const att = attendanceByEmployeeId.get(row.employeeId);
          return {
            employeeId: row.employeeId,
            department: row.department,
            name: row.name,
            totalOff: att?.TotalOff || 0,
            workDays: att?.WorkDays || 0,
            department: row.department,
            status: row.status,
          };
        });

        const totalEmployees = employees.length;
        const present = attendancePayload.stats?.present || 0;
        const absent = attendancePayload.stats?.absent || 0;
        const leave = attendancePayload.stats?.leave || 0;

        setAttendanceRows(mergedAttendanceRows);
        setReportRows(summaryRowsData);
        setReportMeta({
          yearMonth: summaryPayload.yearMonth || '',
          totalStats: summaryPayload.total_stats || null,
          weekdayStats: summaryPayload.weekday_stats || [0, 0, 0, 0, 0, 0, 0],
        });
        setCurrentPage(1);
        setTodayRows(todayData);
        setSummary({
          totalWorkDays: summaryPayload.total_stats?.total_work_days || 0,
          averageAttendance:
            totalEmployees && summaryPayload.total_stats?.total_work_days
              ? `${(((summaryPayload.total_stats?.total_present_days || 0) / summaryPayload.total_stats.total_work_days) * 100).toFixed(1)}%`
              : '0%',
          totalWorkHours: `${(summaryPayload.total_stats?.total_work_hours || 0).toFixed(1)}h`,
          totalOvertimeHours: `${(summaryPayload.total_stats?.total_overtime_hours || 0).toFixed(1)}h`,
          totalEmployees,
          present,
          absent,
          leave,
        });
        setErrorMessage('');
      } catch (err) {
        console.error('Loi tai du lieu:', err);
        setAttendanceRows([]);
        setReportRows([]);
        setReportMeta({ yearMonth: '', totalStats: null, weekdayStats: [0, 0, 0, 0, 0, 0, 0] });
        setCurrentPage(1);
        setTodayRows([]);
        setSummary({ totalWorkDays: 0, averageAttendance: '0%', totalWorkHours: '0h', totalOvertimeHours: '0h' });
        setErrorMessage(`Không tải được dữ liệu: ${err.message || 'Lỗi kết nối server'}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendanceData();
  }, [apiUrl, selectedMonth, selectedDate]);

  // ─── Reset trang khi đổi phòng ban ────────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
    setTodayPage(1);
  }, [selectedDepartment]);

  // ─── Dữ liệu đã lọc ──────────────────────────────────────────────────────
  const departmentOptions = useMemo(() => {
    const values = Array.from(
      new Set(attendanceRows.map((row) => row.department).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'vi'));
    return values;
  }, [attendanceRows]);

  const filteredAttendanceRows = useMemo(() => {
    if (selectedDepartment === 'ALL') return attendanceRows;
    return attendanceRows.filter((row) => row.department === selectedDepartment);
  }, [attendanceRows, selectedDepartment]);

  const filteredTodayRows = useMemo(() => {
    if (selectedDepartment === 'ALL') return todayRows;
    return todayRows.filter((row) => row.department === selectedDepartment);
  }, [todayRows, selectedDepartment]);

  // ─── Lịch ────────────────────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    if (!selectedMonth || !selectedMonth.includes('-')) return [];
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    if (isNaN(year) || isNaN(month)) return [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const shift = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = shift - 1; i >= 0; i--) days.push({ day: prevMonthLastDay - i, muted: true, date: null });
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ day: i, muted: false, date: `${yearStr}-${monthStr}-${String(i).padStart(2, '0')}` });
    }
    for (let i = 1; i <= 42 - days.length; i++) days.push({ day: i, muted: true, date: null });
    return days;
  }, [selectedMonth]);

  // ─── Phân trang bảng chính ───────────────────────────────────────────────
  const presentCount = filteredAttendanceRows.filter((r) => r.status === 'Đi làm' || r.status === 'Trễ').length;
  const absentCount = filteredAttendanceRows.filter((r) => r.status === 'Vắng mặt').length;
  const leaveCount = filteredAttendanceRows.filter((r) => r.status === 'Nghỉ phép' || r.status === 'Nghỉ ốm').length;
  const holidayCount = filteredAttendanceRows.filter((r) => r.status === 'Nghỉ lễ').length;
  const totalEntries = filteredAttendanceRows.length;
  const totalPages = Math.max(Math.ceil(totalEntries / PAGE_SIZE), 1);
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalEntries);
  const pagedAttendanceRows = filteredAttendanceRows.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safePage <= 3) return [1, 2, 3, 4, totalPages];
    if (safePage >= totalPages - 2) return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, safePage - 1, safePage, safePage + 1, totalPages];
  }, [safePage, totalPages]);

  // ─── Phân trang bảng hôm nay ─────────────────────────────────────────────
  const todayTotal = filteredTodayRows.length;
  const todayTotalPages = Math.max(Math.ceil(todayTotal / TODAY_PAGE_SIZE), 1);
  const todaySafePage = Math.min(todayPage, todayTotalPages);
  const todayStartIdx = (todaySafePage - 1) * TODAY_PAGE_SIZE;
  const todayEndIdx = Math.min(todayStartIdx + TODAY_PAGE_SIZE, todayTotal);
  const pagedTodayRows = filteredTodayRows.slice(todayStartIdx, todayEndIdx);

  const todayPageNumbers = useMemo(() => {
    if (todayTotalPages <= 5) return Array.from({ length: todayTotalPages }, (_, i) => i + 1);
    if (todaySafePage <= 3) return [1, 2, 3, 4, todayTotalPages];
    if (todaySafePage >= todayTotalPages - 2) return [1, todayTotalPages - 3, todayTotalPages - 2, todayTotalPages - 1, todayTotalPages];
    return [1, todaySafePage - 1, todaySafePage, todaySafePage + 1, todayTotalPages];
  }, [todaySafePage, todayTotalPages]);

  return {
    // Trạng thái
    isLoading, errorMessage, summary,
    // Dữ liệu báo cáo
    reportRows, reportMeta,
    // Bộ lọc
    selectedDepartment, setSelectedDepartment, departmentOptions,
    selectedMonth, setSelectedMonth,
    selectedDate, setSelectedDate,
    availableMonths,
    handlePrevMonth, handleNextMonth,
    // Lịch
    calendarDays,
    // Bảng chính (đã phân trang)
    pagedAttendanceRows, totalEntries, startIndex, endIndex,
    safePage, totalPages, currentPage, setCurrentPage, pageNumbers,
    // Thống kê nhanh
    presentCount, absentCount, leaveCount, holidayCount,
    // Bảng hôm nay (đã phân trang)
    filteredTodayRows, pagedTodayRows,
    todayTotal, todayStartIdx, todayEndIdx,
    todaySafePage, todayTotalPages, todayPage, setTodayPage, todayPageNumbers,
    // Dữ liệu thô (dùng cho trang khác)
    attendanceRows, apiUrl,
  };
}

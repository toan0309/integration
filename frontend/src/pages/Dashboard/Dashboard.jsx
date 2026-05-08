import React from "react";
import "./Dashboard.scss";
// Component imports will go here
import StatCard from "./components/StatCard";
import EmployeesChart from "./components/EmployeesChart";
import RecentActivity from "./components/RecentActivity";
import DividendList from "./components/DividendList";
import SalaryTrendChart from "./components/SalaryTrendChart";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="top-stats-row">
        <StatCard title="Tổng nhân viên" value="562" percent="+12%" />
        <StatCard title="Đi làm hôm nay" value="562" percent="+12%" />
        <StatCard title="Nghỉ phép" value="562" percent="+12%" />
        <StatCard title="Cổ tức Q2 2026" value="$5,245" percent="+5%" type="blue" />
        <StatCard title="Tổng doanh thu" value="$953.55" percent="+5%" type="green" />
      </div>

      <div className="middle-section-row">
        <div className="chart-card employees-card">
          <EmployeesChart />
        </div>
        <div className="chart-card activity-card">
          <RecentActivity />
        </div>
      </div>

      <div className="bottom-section-row">
        <div className="chart-card dividend-card">
          <DividendList />
        </div>
        <div className="chart-card salary-card">
          <SalaryTrendChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

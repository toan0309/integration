import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import "./EmployeesChart.scss";

const data = [
  { name: "Kinh Doanh", value: 85 },
  { name: "Công nghệ", value: 60 },
  { name: "Marketing", value: 70 },
  { name: "Kế toán", value: 15 },
  { name: "Tài chính", value: 88 },
  { name: "Hành chính", value: 87 },
];

const EmployeesChart = () => {
  return (
    <div className="employees-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Nhân viên theo phòng ban</h3>
        <select className="period-select">
          <option>This Month</option>
        </select>
      </div>
      <div className="chart-body">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "#94a3b8" }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "#94a3b8" }} 
              ticks={[20, 40, 60, 80, 100]}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmployeesChart;

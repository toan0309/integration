import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import "./SalaryTrendChart.scss";

const data = [
  { name: "August", value: 550 },
  { name: "September", value: 300 },
  { name: "October", value: 450 },
  { name: "November", value: 650 },
  { name: "December", value: 400 },
  { name: "January", value: 700 },
  { name: "February", value: 600 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="value">{`${payload[0].value * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
        <p className="label">{`5 ${label} 2020`}</p>
      </div>
    );
  }
  return null;
};

const SalaryTrendChart = () => {
  return (
    <div className="salary-trend-container">
      <div className="chart-header">
        <h3 className="chart-title">Xu hướng lương</h3>
        <div className="time-filters">
          <span className="filter">Monthly</span>
          <span className="filter">Weekly</span>
          <span className="filter">Daily</span>
        </div>
      </div>

      <div className="chart-stats-row">
        <div className="main-stat">
          <span className="value">867,123k</span>
          <span className="trend positive">▲ +9% from last month</span>
        </div>
        <button className="download-btn">Download CSV</button>
      </div>

      <div className="chart-body">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
              tick={{ fontSize: 10, fill: "#94a3b8", formatter: (val) => `${val}k` }} 
              ticks={[200, 400, 600, 800, 1000]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalaryTrendChart;

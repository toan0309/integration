import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import "./StatCard.scss";

const StatCard = ({ title, value, percent, type = "default" }) => {
  const isColored = type === "blue" || type === "green";
  
  // Fake data for pie chart
  const data = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
  ];
  const COLORS = type === "blue" ? ["#ffffff", "rgba(255,255,255,0.3)"] : ["#ffffff", "rgba(255,255,255,0.3)"];

  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        <div className={`stat-percent ${percent.startsWith("+") ? "positive" : "negative"}`}>
          {percent}
        </div>
      </div>
      
      {isColored && (
        <div className="stat-chart">
          <PieChart width={60} height={60}>
            <Pie
              data={data}
              cx={25}
              cy={25}
              innerRadius={20}
              outerRadius={25}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <div className="chart-center-text">+5%</div>
        </div>
      )}
    </div>
  );
};

export default StatCard;

import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { FiCheck } from "react-icons/fi";
import "./DividendList.scss";

const sparklineDataRed = [
  { value: 40 }, { value: 60 }, { value: 30 }, { value: 50 }, { value: 40 }, { value: 20 }
];

const sparklineDataGreen = [
  { value: 20 }, { value: 30 }, { value: 25 }, { value: 60 }, { value: 45 }, { value: 55 }
];

const DividendItem = ({ tag, title, date, percent, trend, data, color }) => (
  <div className="dividend-item">
    <div className="item-info">
      <div className="tag">{tag}</div>
      <h4 className="title">{title}</h4>
      <div className="date">
        <FiCheck className="check-icon" /> Published on {date}
      </div>
    </div>
    <div className="item-chart">
      <ResponsiveContainer width={100} height={40}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="item-stats">
      <div className="percent">{percent}</div>
      <div className="insight">User Insight</div>
    </div>
  </div>
);

const DividendList = () => {
  return (
    <div className="dividend-list-container">
      <div className="list-header">
        <h3 className="list-title">Cổ tức</h3>
        <div className="time-filters">
          <span className="filter active">Monthly</span>
          <span className="filter">Weekly</span>
          <span className="filter">Daily</span>
        </div>
      </div>
      
      <div className="list-content">
        <DividendItem 
          tag="#AD-001245"
          title="50% OFF Floor Lamp Get it Now!"
          date="January 25, 2021"
          percent="-2%"
          trend="down"
          data={sparklineDataRed}
          color="#ef4444"
        />
        <div className="divider"></div>
        <DividendItem 
          tag="#AD-001245"
          title="50% OFF Floor Lamp Get it Now!"
          date="January 25, 2021"
          percent="-2%"
          trend="up"
          data={sparklineDataGreen}
          color="#22c55e"
        />
      </div>
    </div>
  );
};

export default DividendList;

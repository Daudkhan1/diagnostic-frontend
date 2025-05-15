// import React, { useState } from "react";
// import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  // PointElement,
  // LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// import { Select } from "@/components/common";
import {
  // monthList,
  chartData,
  chartOptions,
} from "./data";

import "./styles.scss";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  // PointElement,
  // LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = () => {
  // const [month, setMonth] = useState("January");

  // const handleMonthChange = (value) => {
  //   setMonth(() => value);
  // };

  return (
    <section className="line-chart-main-container">
      <section className="chart-header-actions">
        <h4 className="heading">Overall Requests</h4>

        {/* <Select
          // label="Month"
          options={monthList}
          value={month}
          onChange={handleMonthChange}
          height="54px"
        /> */}
      </section>

      <section className="line-chart-custom-wrapper">
        {/* <Line data={chartData} options={chartOptions} /> */}
        <Bar data={chartData} options={chartOptions} />
      </section>
    </section>
  );
};

export default LineChart;

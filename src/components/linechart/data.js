// export const monthList = [
//   { value: "january", label: "January" },
//   {
//     value: "february",
//     label: "February",
//   },
//   { value: "march", label: "March" },
//   { value: "april", label: "April" },
//   { value: "may", label: "May" },
//   { value: "june", label: "June" },
//   { value: "july", label: "July" },
//   { value: "august", label: "August" },
//   { value: "september", label: "September" },
//   { value: "october", label: "October" },
//   { value: "november", label: "November" },
//   { value: "december", label: "December" },
// ];

// export const chartData = {
//   labels: ["New Request", "Inprogress", "Pending"], // Y-axis labels (left)
//   datasets: [
//     {
//       data: [65, 28, 12], // Number readings for New Request, Inprogress, Pending
//       borderColor: "#418CFD",
//       backgroundColor: "#418CFD",
//       borderDash: [5, 5], // Make the lines dotted
//       fill: false,
//       tension: 0.4,
//     },
//     {
//       data: [59, 48, 42],
//       borderColor: "#FFC107",
//       backgroundColor: "#FFC107",
//       borderDash: [5, 5],
//       fill: false,
//       tension: 0.4,
//     },
//     {
//       data: [80, 40, 30],
//       borderColor: "#FF1744",
//       backgroundColor: "#FF1744",
//       borderDash: [5, 5],
//       fill: false,
//       tension: 0.4,
//     },
//     {
//       data: [81, 19, 25],
//       borderColor: "#33B5E5",
//       backgroundColor: "#33B5E5",
//       borderDash: [5, 5],
//       fill: false,
//       tension: 0.4,
//     },
//   ],
// };

// export const chartOptions = {
//   responsive: true,
//   indexAxis: "y",
//   plugins: {
//     legend: {
//       display: false,
//     },
//   },
//   scales: {
//     x: {
//       beginAtZero: true,
//       ticks: {
//         callback: function (value) {
//           return `${value}`;
//         },
//       },
//       grid: {
//         borderDash: [5, 5],
//       },
//     },
//     y: {
//       ticks: {
//         autoSkip: false,
//       },
//       grid: {
//         borderDash: [5, 5],
//       },
//     },
//   },
// };

export const chartData = {
  labels: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ], // Labels for the x-axis
  // datasets: [
  //   {
  //     label: "Sales Data", // Label for the dataset
  //     data: [65, 59, 80, 81, 56], // The values of the bars
  //     backgroundColor: "rgba(75, 192, 192, 0.2)", // Bar color
  //     borderColor: "rgba(75, 192, 192, 1)", // Bar border color
  //     borderWidth: 1, // Border width
  //   },
  // ],
  datasets: [
    {
      label: "Total Cases",
      data: [110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220], // Data for Total Cases
      backgroundColor: "rgba(255, 99, 132, 0.6)", // Color for Total Cases bars
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1,
    },
    {
      label: "InProgress Cases",
      data: [40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150], // Data for InProgress Cases
      backgroundColor: "rgba(54, 162, 235, 0.6)", // Color for InProgress Cases bars
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1,
    },
    {
      label: "Completed Cases",
      data: [80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190], // Data for Completed Cases
      backgroundColor: "rgba(75, 192, 192, 0.6)", // Color for Completed Cases bars
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
    {
      label: "Total Patients",
      data: [200, 210, 220, 230, 300, 310, 320, 330, 340, 340, 350, 400], // Data for Total Patients
      backgroundColor: "rgba(153, 102, 255, 0.6)", // Color for Total Patients bars
      borderColor: "rgba(153, 102, 255, 1)",
      borderWidth: 1,
    },
  ],
};

export const chartOptions = {
  responsive: true,
  indexAxis: "x",
  plugins: {
    title: {
      display: true,
      text: "Monthly Cases",
    },
    legend: {
      position: "top",
    },
  },
};

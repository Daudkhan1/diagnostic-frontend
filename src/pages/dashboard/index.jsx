import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import {
  DashTotalIcon,
  DashActiveIcon,
  DashInactiveIcon,
  DashPendingIcon,
  DashTotalCasesIcon,
  DashInProgressIcon,
  DashCompletedIcon,
  DashTotalPatientsIcon,
} from "@/assets/svg";
import { DashboardTemplate, DashboardCard, LineChart } from "@/components";
import { getDashboardCard } from "@/services/dashboardService";
import { getDashboardName } from "@/utils/helpers";

const Dashboard = () => {
  const [cardData, setCardData] = useState({});

  const { fullName, role } = useSelector((state) => state.session.user);

  const fetchCardsData = async () => {
    try {
      const data = await getDashboardCard();

      setCardData(() => data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCardsData();
  }, []);

  const dashboardCards = [
    {
      icon: <DashTotalIcon />,
      metrics: cardData?.users?.totalUsers,
      title: "Total Users",
    },
    {
      icon: <DashActiveIcon />,
      metrics: cardData?.users?.activeUsers,
      title: "Active Users",
    },
    {
      icon: <DashInactiveIcon />,
      metrics: cardData?.users?.inactiveUsers,
      title: "InActive Users",
    },
    {
      icon: <DashPendingIcon />,
      metrics: cardData?.users?.pendingUsers,
      title: "Pending Users",
    },
  ];

  const dashboardAdditionalCards = [
    {
      icon: <DashTotalCasesIcon />,
      metrics: cardData?.cases?.totalCases,
      title: "Total Cases",
    },
    {
      icon: <DashInProgressIcon />,
      metrics: cardData?.cases?.inProgressCases,
      title: "InProgress Cases",
    },
    {
      icon: <DashCompletedIcon />,
      metrics: cardData?.cases?.completedCases,
      title: "Completed Cases",
    },
    {
      icon: <DashTotalPatientsIcon />,
      metrics: cardData?.patients,
      title: "Total Patients",
    },
  ];

  return (
    <DashboardTemplate
      heading={`Hi, ${getDashboardName(fullName)}`}
      caption="Welcome to Diagnostic AI!"
    >
      {role === "ADMIN" && (
        <section className="admin-cards-list">
          {dashboardCards.map((card, index) => (
            <DashboardCard key={`dashboard-card-${index}`} {...card} />
          ))}
        </section>
      )}

      <section className="admin-additional-cards-list">
        <section className="admin-cards-list">
          {dashboardAdditionalCards.map((card, index) => (
            <DashboardCard
              key={`dashboard-additional-card-${index}`}
              classes="colored"
              {...card}
            />
          ))}
        </section>
      </section>

      <LineChart />
    </DashboardTemplate>
  );
};

export default Dashboard;

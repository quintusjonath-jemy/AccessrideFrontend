import { useEffect, useState } from "react";
import axios from "axios";

import DashboardHeader from "../components/DashboardHeader";
import WelcomeSection from "../components/WelcomeSection";
import VoiceBookingCard from "../components/VoiceBookingCard";
import QuickActions from "../components/QuickActions";
import UpcomingRideCard from "../components/UpcomingRideCard";

function UserDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    console.log("USER ID:", userId);

    if (!userId) {
      setLoading(false);
      setError("User not logged in");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          `http://localhost/UserDashboard/api/dashboard.php?user_id=${userId}`,
        );

        console.log("API RESPONSE:", res.data);

        if (res.data?.success && res.data?.data) {
          console.log("SETTING DASHBOARD:", res.data.data);
          setDashboard(res.data.data);
        } else {
          console.log("INVALID RESPONSE");
          setDashboard(null);
        }
      } catch (err) {
        console.error("API ERROR:", err);
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    console.log("DASHBOARD STATE:", dashboard);
  }, [dashboard]);

  // LOADING STATE
  if (loading) {
    return <div className="p-5">Loading Dashboard...</div>;
  }

  // ERROR STATE
  if (error) {
    return <div className="p-5 text-red-500">{error}</div>;
  }

  // EMPTY STATE
  if (!dashboard) {
    return <div className="p-5 text-gray-500">No dashboard data found</div>;
  }

  return (
    <>
      <DashboardHeader />

      <WelcomeSection name={dashboard?.user?.name || "User"} />

      <VoiceBookingCard />

      <QuickActions />

      {dashboard && <UpcomingRideCard ride={dashboard.upcoming_ride} />}

      <div className="h-24"></div>
    </>
  );
}

export default UserDashboard;

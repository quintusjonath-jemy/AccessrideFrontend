import { useEffect, useState } from "react";
import axios from "axios";

import DashboardHeader from "../components/DashboardHeader";
import WelcomeSection from "../components/WelcomeSection";
import VoiceBookingCard from "../components/VoiceBookingCard";
import QuickActions from "../components/QuickActions";
import UpcomingRideCard from "../components/UpcomingRideCard";
import RecentRides from "../components/RecentRides";

function UserDashboard() {
  const [dashboard, setDashboard] = useState({
    user: {},
    statistics: {},
    upcoming_ride: null,
    recent_rides: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "1";

    console.log("USER ID:", userId);

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          `http://localhost/UserDashboard/api/dashboard.php?user_id=${userId}`,
        );

        console.log("API RESPONSE:", res.data);

        if (res.data?.success && res.data?.data) {
          setDashboard(res.data.data);
        } else {
          setError(res.data?.message || "Invalid dashboard data");
        }
      } catch (err) {
        console.error("API ERROR:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    console.log("DASHBOARD STATE:", dashboard);
  }, [dashboard]);

  // LOADING FIRST
  if (loading) {
    return <div className="p-5">Loading Dashboard...</div>;
  }

  // ERROR SECOND
  if (error) {
    return <div className="p-5 text-red-500">{error}</div>;
  }

  return (
    <>
      <DashboardHeader />

      {/* 3. Pass user object instead of name */}
      <WelcomeSection user={dashboard?.user} />

      <VoiceBookingCard />

      {/* 4. Pass statistics to QuickActions */}
      <QuickActions statistics={dashboard?.statistics} />

      {dashboard?.upcoming_ride && (
        <UpcomingRideCard ride={dashboard.upcoming_ride} />
      )}

      {/* 5. Render RecentRides list */}
      {dashboard?.recent_rides && dashboard.recent_rides.length > 0 && (
        <RecentRides rides={dashboard.recent_rides} />
      )}

      <div className="h-24"></div>
    </>
  );
}

export default UserDashboard;

import { useEffect, useState } from "react";
import axios from "axios";

import DashboardHeader from "../../components/user/DashboardHeader";
import WelcomeSection from "../../components/user/WelcomeSection";
import VoiceBookingCard from "../../components/user/VoiceBookingCard";
import QuickActions from "../../components/user/QuickActions";
import UpcomingRideCard from "../../components/user/UpcomingRideCard";
import RecentRides from "../../components/user/RecentRides";

const UserDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        "http://localhost/UserDashboard/api/dashboard.php?user_id=1",
      );

      if (response.data.success) {
        setDashboard(response.data.data);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen pb-24">
      <DashboardHeader user={dashboard.user} />

      <WelcomeSection user={dashboard.user} />

      <VoiceBookingCard />

      <QuickActions statistics={dashboard.statistics} />

      <UpcomingRideCard ride={dashboard.upcoming_ride} />

      <RecentRides rides={dashboard.recent_rides} />
    </div>
  );
}

export default UserDashboard;

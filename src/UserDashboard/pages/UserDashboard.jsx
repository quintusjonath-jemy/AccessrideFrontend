import { useEffect, useState } from "react";
import axios from "axios";

import DashboardHeader from "../components/DashboardHeader";
import WelcomeSection from "../components/WelcomeSection";
import VoiceBookingCard from "../components/VoiceBookingCard";
import QuickActions from "../components/QuickActions";
import UpcomingRideCard from "../components/UpcomingRideCard";
import RecentRides from "../components/RecentRides";

const UserDashboard = () => {
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

    // Request user location in the background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sessionStorage.setItem("user_latitude", latitude);
          sessionStorage.setItem("user_longitude", longitude);
        },
        (err) => {
          console.warn("Could not retrieve geolocation in dashboard:", err);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
      );
    }

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          `http://localhost/UserDashboard/api/dashboard.php?user_id=${userId}`,
        );

        if (res.data?.success && res.data?.data) {
          setDashboard(res.data.data);
        } else {
          setError(res.data?.message || "Invalid dashboard data");
        }
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // LOADING FIRST
  if (loading) {
    return <div className="p-5">Loading Dashboard...</div>;
  }

  // ERROR SECOND
  if (error) {
    return <div className="p-5 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-slate-100 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans w-full">
      <div className="w-full max-w-md bg-slate-100 min-h-screen pb-[90px] relative flex flex-col shadow-2xl overflow-x-hidden">
        <DashboardHeader user={dashboard?.user} />

        <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardHeader from "../components/DashboardHeader";
import WelcomeSection from "../components/WelcomeSection";
import { VoiceAssistantButton } from "../components/voiceassistant/VoiceAssistant";
import QuickActions from "../components/QuickActions";
import UpcomingRideCard from "../components/UpcomingRideCard";
import RecentRides from "../components/RecentRides";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    user: {},
    statistics: {},
    upcoming_ride: null,
    recent_rides: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    // Request user location in the background and update database
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          sessionStorage.setItem("user_latitude", latitude);
          sessionStorage.setItem("user_longitude", longitude);

          try {
            // Reverse geocode to get a readable address using Mapbox
            const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&limit=1`;
            const response = await fetch(url);
            const data = await response.json();

            let resolvedLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            if (data.features && data.features.length > 0) {
              resolvedLocation = data.features[0].place_name;
            }

            // Update user location in the database
            await axios.post("http://localhost/UserDashboard/api/update_location.php", {
              user_id: userId,
              location: resolvedLocation
            });

            // Update dashboard user state with the fresh location
            setDashboard(prev => ({
              ...prev,
              user: {
                ...prev.user,
                location: resolvedLocation
              }
            }));
          } catch (err) {
            console.error("Failed to update user location in database:", err);
          }
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

          <div className="mx-5 mt-5">
            <VoiceAssistantButton
              pageName="AccessRide"
              welcomePrompt={`Welcome back${dashboard?.user?.first_name ? ', ' + dashboard.user.first_name : ''}. Say book a ride, take me home, same as last time, track my driver, or SOS.`}
            />
          </div>

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

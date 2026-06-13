import DashboardHeader from "../components/DashboardHeader";
import QuickActions from "../components/QuickActions";
import UpcomingRideCard from "../components/UpcomingRideCard";
import VoiceBookingCard from "../components/VoiceBookingCard";
import WelcomeSection from "../components/WelcomeSection";

const UserDashboard = () => {
  return (
    <>
      <DashboardHeader />

      <WelcomeSection />

      <VoiceBookingCard />

      <QuickActions />

      <UpcomingRideCard />

      <div className="h-24"></div>
    </>
  );
}

export default UserDashboard;

import { Outlet } from "react-router-dom";
import EmergencyBottomNavigation from "./EmergencyBottomNavigation";

const EmergencyLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <Outlet />

      <EmergencyBottomNavigation />
    </div>
  );
};

export default EmergencyLayout;

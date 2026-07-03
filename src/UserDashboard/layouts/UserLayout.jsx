import { Outlet } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <Outlet />
      <BottomNavigation />
    </div>
  );
};

export default UserLayout;

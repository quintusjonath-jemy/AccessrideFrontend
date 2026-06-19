import { Outlet } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <Outlet />

      <div className="fixed bottom-0 left-0 w-full">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default UserLayout;

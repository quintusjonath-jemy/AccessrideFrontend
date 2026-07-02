import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";

const UserLayout = () => {
  const location = useLocation();
  const isHistoryPage = location.pathname === "/user/history";

  return (
    <div className={`min-h-screen bg-slate-100 ${!isHistoryPage ? "pb-16" : ""}`}>
      <Outlet />

      {!isHistoryPage && (
        <BottomNavigation />
      )}
    </div>
  );
};

export default UserLayout;

import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";

const UserLayout = () => {
  const location = useLocation();
  const isSOSPage = location.pathname === "/user/sos";
  const isHistoryPage = location.pathname === "/user/history";

  return (
    <div className={`min-h-screen bg-slate-100 ${!isSOSPage && !isHistoryPage ? "pb-16" : ""}`}>
      <Outlet />

      {!isSOSPage && !isHistoryPage && (
        <div className="fixed bottom-0 left-0 w-full">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
};

export default UserLayout;

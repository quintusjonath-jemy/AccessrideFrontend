import { Outlet, useLocation } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";

const UserLayout = () => {
  const location = useLocation();
  const hideFooterPages = ["/user/ride"];
  const shouldHideFooter = hideFooterPages.includes(location.pathname);

  return (
    <div className={`min-h-screen bg-slate-100 ${!shouldHideFooter ? "pb-16" : ""}`}>
      <Outlet />

      {!shouldHideFooter && (
        <div className="fixed bottom-0 left-0 w-full">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
};

export default UserLayout;

import { Outlet } from "react-router-dom";
import DriverBottomNavigation from "../components/DriverBottomNavigation";

const DriverLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100 py-6 flex justify-center px-3 sm:px-6">
      <div className="mx-auto w-full max-w-[360px] min-h-[932px] flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
        <div className="flex-1 flex flex-col">
          <Outlet />
        </div>
        <DriverBottomNavigation />
      </div>
    </div>
  );
};

export default DriverLayout;

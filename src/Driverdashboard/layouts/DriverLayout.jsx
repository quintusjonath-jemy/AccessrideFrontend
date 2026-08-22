import { Outlet } from "react-router-dom";
import DriverBottomNavigation from "../components/DriverBottomNavigation";

const DriverLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center pb-24 md:py-10">
      <div className="w-full max-w-[430px] md:max-w-2xl lg:max-w-[430px] bg-white md:shadow-2xl md:rounded-[2.5rem] md:border border-slate-200 flex flex-col min-h-[100dvh] md:min-h-fit overflow-hidden relative transition-all duration-300">
        <div className="flex-1 flex flex-col h-full overflow-y-auto pb-24 md:pb-32 lg:pb-24">
          <Outlet />
        </div>
        <DriverBottomNavigation />
      </div>
    </div>
  );
};

export default DriverLayout;

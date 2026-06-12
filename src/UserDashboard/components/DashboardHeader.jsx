import { Menu, UserCircle } from "lucide-react";

const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between px-5 py-4 bg-white shadow-sm">
      <button>
        <Menu size={24} />
      </button>

      <h1 className="text-xl font-bold text-[#0B2F89]">
        AccessRide
      </h1>

      <button>
        <UserCircle
          size={32}
          className="text-[#0B2F89]"
        />
      </button>
    </div>
  );
}

export default DashboardHeader;
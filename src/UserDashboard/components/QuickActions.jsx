import { Car, Clock, CheckCircle } from "lucide-react";

const QuickActions = ({ statistics }) => {
  return (
    <div className="mx-5 mt-5 grid grid-cols-3 gap-3">
      <div className="bg-white rounded-2xl p-4 shadow">
        <Car className="text-[#0B2F89]" />

        <p className="text-sm text-gray-500 mt-2">Total</p>

        <h3 className="font-bold text-xl">{statistics?.total_rides}</h3>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <Clock className="text-orange-500" />

        <p className="text-sm text-gray-500 mt-2">Pending</p>

        <h3 className="font-bold text-xl">{statistics?.pending_rides}</h3>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <CheckCircle className="text-green-500" />

        <p className="text-sm text-gray-500 mt-2">Completed</p>

        <h3 className="font-bold text-xl">{statistics?.completed_rides}</h3>
      </div>
    </div>
  );
}

export default QuickActions;

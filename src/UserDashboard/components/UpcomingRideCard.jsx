const UpcomingRideCard = () => {
  return (
    <div className="mx-5 mt-5 bg-white rounded-2xl p-5 shadow">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">
          Your Next Ride
        </h3>

        <button className="text-[#0B2F89] text-sm">
          View All
        </button>
      </div>

      <div className="mt-4">
        <p className="font-semibold">
          Today at 4:30 PM
        </p>

        <div className="mt-3">
          <p className="text-gray-500 text-sm">
            Pickup
          </p>

          <p>Colombo Fort</p>
        </div>

        <div className="mt-3">
          <p className="text-gray-500 text-sm">
            Destination
          </p>

          <p>National Hospital</p>
        </div>

        <button
          className="
          mt-4
          bg-yellow-400
          px-4
          py-2
          rounded-lg
          font-medium
        "
        >
          Details
        </button>
      </div>
    </div>
  );
}

export default UpcomingRideCard;
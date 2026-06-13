const UpcomingRideCard = ({ ride }) => {
  if (!ride) {
    return (
      <div className="mx-5 mt-5 bg-white rounded-2xl p-5 shadow">
        No upcoming rides
      </div>
    );
  }

  return (
    <div className="mx-5 mt-5 bg-white rounded-2xl p-5 shadow">
      <div className="flex justify-between">
        <h3 className="font-bold text-lg">Upcoming Ride</h3>

        <span className="text-xs bg-yellow-100 px-2 py-1 rounded-full">
          {ride.status}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">Pickup</p>

        <p className="font-medium">{ride.pickup_location}</p>
      </div>

      <div className="mt-3">
        <p className="text-sm text-gray-500">Destination</p>

        <p className="font-medium">{ride.dropoff_location}</p>
      </div>

      <div className="mt-3">
        <p className="text-sm text-gray-500">Fare</p>

        <p className="font-medium">Rs. {ride.fare}</p>
      </div>
    </div>
  );
}

export default UpcomingRideCard;

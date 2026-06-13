function RecentRides({ rides }) {
  return (
    <div className="mx-5 mt-5 bg-white rounded-2xl p-5 shadow">
      <h3 className="font-bold text-lg mb-4">Recent Rides</h3>

      {rides.length === 0 ? (
        <p>No rides found</p>
      ) : (
        rides.map((ride) => (
          <div key={ride.id} className="border-b py-3 last:border-b-0">
            <div className="flex justify-between">
              <p className="font-medium">{ride.pickup_location}</p>

              <span className="text-sm text-gray-500">{ride.status}</span>
            </div>

            <p className="text-sm text-gray-500">{ride.dropoff_location}</p>

            <p className="text-sm font-medium mt-1">Rs. {ride.fare}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default RecentRides;

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const RidePage = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [rideInfo] = useState({
    passengerName: "Amira Patel",
    passengerRating: 4.8,
    pickup: "123 Central Library",
    dropoff: "Central Hospital",
    distance: 5.2,
    eta: 18,
    fare: 288,
    passengers: 1,
    status: "Started",
    startedAt: "10:15 AM"
  });

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken =
      "pk.eyJ1IjoiYWNjZXNzcmlkZSIsImEiOiJjbHp0bDg3bXMwMDAwMnJwNHR4ZTU0MmIyIn0.demo";

    const pickupPoint = [6.9271, 7.3869];
    const dropoffPoint = [6.9150, 7.4200];
    const driverPosition = [6.9210, 7.4000];

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: driverPosition,
      zoom: 13.5,
      pitch: 45,
      bearing: -60
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [pickupPoint, driverPosition, dropoffPoint]
          }
        }
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#2563eb",
          "line-width": 4,
          "line-opacity": 0.85
        }
      });
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-left");

    new mapboxgl.Marker({ color: "#22c55e" })
      .setLngLat(pickupPoint)
      .addTo(map);

    new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat(dropoffPoint)
      .addTo(map);

    const driverMarker = document.createElement("div");
    driverMarker.className =
      "w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg";

    new mapboxgl.Marker(driverMarker)
      .setLngLat(driverPosition)
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const callPassenger = () => {
    window.alert("Calling passenger...");
  };

  const navigateToDropoff = () => {
    window.alert("Opening navigation to drop-off...");
  };

  const completeRide = () => {
    window.alert("Ride completed.");
  };

  const cancelRide = () => {
    window.alert("Ride canceled.");
  };

  return (
    <div className="bg-gray-200 flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <button className="text-xl">←</button>
          <h1 className="font-bold text-lg text-blue-900">Ride in Progress</h1>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="relative bg-gray-300 rounded-2xl h-52 overflow-hidden">
            <div ref={mapContainer} className="w-full h-full rounded-2xl" />

            <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-100">
              📍
            </button>

            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
              2.4 km to Drop-off
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
                <div>
                  <h2 className="font-semibold">{rideInfo.passengerName}</h2>
                  <p className="text-sm text-gray-500">⭐ {rideInfo.passengerRating}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full font-bold text-lg"
                  onClick={callPassenger}
                  title="Call Passenger"
                >
                  📞
                </button>
                <button className="bg-blue-900 hover:bg-blue-800 text-white p-2 rounded-full">💬</button>
              </div>
            </div>

            <hr />

            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium">{rideInfo.pickup}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Drop-off</p>
                  <p className="font-medium">{rideInfo.dropoff}</p>
                </div>

                <button
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm"
                  onClick={navigateToDropoff}
                >
                  Navigate
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-gray-100 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Dist.</p>
              <p className="font-bold">{rideInfo.distance}</p>
              <p className="text-xs text-gray-400">km</p>
            </div>

            <div className="bg-gray-100 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-bold">{rideInfo.eta}</p>
              <p className="text-xs text-gray-400">min</p>
            </div>

            <div className="bg-gray-100 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Fare</p>
              <p className="font-bold">{rideInfo.fare}</p>
              <p className="text-xs text-gray-400">Rs.</p>
            </div>

            <div className="bg-gray-100 p-3 rounded-xl">
              <p className="text-xs text-gray-500">Pass.</p>
              <p className="font-bold">{rideInfo.passengers}</p>
              <p className="text-xs text-gray-400">user</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 text-center">
            <div className="flex justify-between text-xs mb-2">
              <span>Accepted</span>
              <span>Arrived</span>
              <span className="text-yellow-600 font-bold">{rideInfo.status}</span>
              <span>Completed</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="w-6 h-6 bg-blue-900 rounded-full" />
              <div className="flex-1 h-1 bg-blue-900" />
              <div className="w-6 h-6 bg-blue-900 rounded-full" />
              <div className="flex-1 h-1 bg-gray-300" />
              <div className="w-6 h-6 bg-yellow-400 rounded-full border-4 border-white" />
              <div className="flex-1 h-1 bg-gray-300" />
              <div className="w-6 h-6 bg-gray-300 rounded-full" />
            </div>

            <p className="text-sm mt-3 text-gray-600">Ride started at {rideInfo.startedAt}</p>
          </div>

          <button
            className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold"
            onClick={completeRide}
          >
            COMPLETE RIDE
          </button>

          <button
            className="w-full bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold"
            onClick={cancelRide}
          >
            CANCEL RIDE
          </button>
        </div>
      </div>
    </div>
  );
};

export default RidePage;

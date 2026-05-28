import { useEffect, useRef } from "react";

import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN";

function LiveMap({ rides }) {

  const mapContainer = useRef(null);

  const map = useRef(null);

  useEffect(() => {

    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,

      style: "mapbox://styles/mapbox/streets-v12",

      center: [79.8612, 6.9271], // Colombo

      zoom: 11,
    });

  }, []);

  // ADD MARKERS
  useEffect(() => {

    if (!map.current) return;

    rides.forEach((ride) => {

      // RANDOM DEMO LOCATION
      // Later replace with real GPS

      const lng =
        79.85 + Math.random() * 0.05;

      const lat =
        6.90 + Math.random() * 0.05;

      // CREATE MARKER
      new mapboxgl.Marker({
        color:
          ride.status === "active"
            ? "green"
            : ride.status === "pending"
            ? "orange"
            : "red",
      })

        .setLngLat([lng, lat])

        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div>
              <h3>${ride.user_name}</h3>

              <p>${ride.pickup_location}</p>

              <p>Status: ${ride.status}</p>
            </div>
          `)
        )

        .addTo(map.current);

    });

  }, [rides]);

  return (

    <div
      ref={mapContainer}
      className="w-full h-[400px] rounded-2xl overflow-hidden"
    ></div>

  );
}

export default LiveMap;
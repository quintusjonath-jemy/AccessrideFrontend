import { useEffect, useRef } from "react";

import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "";

function LiveMap({ rides }) {

  const mapContainer = useRef(null);

  const map = useRef(null);

  const markersRef = useRef([]);

  // CREATE MAP
  useEffect(() => {

    if (map.current) return;

    map.current = new mapboxgl.Map({

      container: mapContainer.current,

      style: "mapbox://styles/mapbox/streets-v12",

      center: [79.8612, 6.9271],

      zoom: 11,
    });

  }, []);


  // LIVE MARKERS
  useEffect(() => {

    if (!map.current) return;

    // REMOVE OLD MARKERS
    markersRef.current.forEach((marker) =>
      marker.remove()
    );

    markersRef.current = [];

    rides.forEach((ride) => {

      // DEMO LIVE MOVEMENT
      // Later replace with real GPS

      const lng =
        79.85 + Math.random() * 0.08;

      const lat =
        6.90 + Math.random() * 0.08;

      // CREATE CUSTOM MARKER
      const el = document.createElement("div");

      el.className =
        "w-5 h-5 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse";

      // MARKER
      const marker = new mapboxgl.Marker(el)

        .setLngLat([lng, lat])

        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
          }).setHTML(`
            <div style="padding:5px">
              <h3 style="font-weight:bold">
                ${ride.user_name || "Unknown"}
              </h3>

              <p>
                🚗 ${ride.status}
              </p>

              <p>
                📍 ${ride.pickup_location}
              </p>

              <p>
                🏁 ${ride.dropoff_location}
              </p>
            </div>
          `)
        )

        .addTo(map.current);

      markersRef.current.push(marker);

    });

  }, [rides]);

  return (

    <div
      ref={mapContainer}
      className="w-full h-[450px] rounded-2xl overflow-hidden shadow-md"
    />

  );
}

export default LiveMap;
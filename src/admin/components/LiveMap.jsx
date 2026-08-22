import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TOKEN = mapboxgl.accessToken;

// Calculate distance in km between two points using Haversine formula
const haversineDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) return 0;
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate minimum distance from a driver to any coordinate in the route geometry
const getMinDistanceToRoute = (driverCoords, geometry) => {
  if (!driverCoords || !geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
    return 0;
  }
  let minDistance = Infinity;
  for (const coord of geometry.coordinates) {
    const dist = haversineDistance(driverCoords, coord);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
};

const SRI_LANKA_CITIES = {
  "mannar": [79.9071, 8.9810],
  "vavuniya": [80.4971, 8.7514],
  "colombo": [79.8612, 6.9271],
  "kandy": [80.6337, 7.2906],
  "galle": [80.2170, 6.0535],
  "jaffna": [80.0093, 9.6615],
  "trincomalee": [81.2335, 8.5874],
  "tringomalee": [81.2335, 8.5874],
  "batticaloa": [81.6924, 7.7170],
  "matara": [80.5488, 5.9496],
  "badulla": [81.0550, 6.9934],
  "glen alpin": [81.0757, 6.9819],
  "kurunegala": [80.3647, 7.4863],
  "anuradhapura": [80.4037, 8.3114],
  "polonnaruwa": [81.0003, 7.9403],
  "ratnapura": [80.3992, 6.6828],
  "negombo": [79.8358, 7.2008],
  "kalutara": [79.9593, 6.5854],
  "nuwara eliya": [80.7829, 6.9497],
  "hambantota": [81.1185, 6.1246],
  "dambulla": [80.6517, 7.8731],
  "wellampitiya": [79.8885, 6.9442],
  "central library": [79.8612, 6.9271],
  "central medical plaza": [79.8732, 6.9012],
  "hospital": [79.8732, 6.9012],
  "medical": [79.8732, 6.9012],
  "plaza": [79.8501, 6.9321],
  "market": [79.8501, 6.9321]
};

// Geocode a location query to [longitude, latitude] coordinates
const geocodeLocation = async (query) => {
  if (!query) return [79.8612, 6.9271];
  const lowerQuery = query.toLowerCase().trim();
  
  for (const [cityName, coords] of Object.entries(SRI_LANKA_CITIES)) {
    if (lowerQuery.includes(cityName)) {
      return coords;
    }
  }

  // Parse raw latitude, longitude strings e.g. "6.9271, 79.8612"
  if (lowerQuery.includes(",")) {
    const parts = lowerQuery.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lng, lat];
      }
    }
  }

  try {
    const mapboxApiUrl = import.meta.env.VITE_MAPBOX_API_URL || "https://api.mapbox.com";
    const url = `${mapboxApiUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=lk&limit=1`;
    const res = await axios.get(url);
    if (res.data?.features && res.data.features.length > 0) {
      return res.data.features[0].center; // [lng, lat]
    }
  } catch (err) {
    console.error("Geocoding error in LiveMap:", err);
  }

  return [79.8612, 6.9271];
};

const LiveMap = ({ rides = [], allDrivers = [], center = [79.8612, 6.9271], driversOnly = false, trackedLocation = null }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const routeLayersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [routesData, setRoutesData] = useState({});

  // CREATE MAP
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 11,
    });
  }, [center]);

  useEffect(() => {
    if (!map.current || !center || center.length !== 2) return;

    map.current.flyTo({
      center,
      zoom: 14,
      speed: 1.2,
      essential: true
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (trackedLocation && trackedLocation.length === 2 && !driversOnly) {
      userMarkerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat(trackedLocation)
        .addTo(map.current);
    }
  }, [center, driversOnly, trackedLocation]);

  // Resolve geocoding and direction geometries per ride status dynamically
  useEffect(() => {
    const resolveRoutes = async () => {
      const newRoutesData = { ...routesData };
      let updated = false;

      for (const ride of rides) {
        // Filter out completed rides with successful payment complete immediately
        if (ride.status?.toLowerCase() === "completed" && ride.payment_status?.toLowerCase() === "completed") {
          continue;
        }

        const status = ride.status?.toLowerCase().trim();
        const driverLng = parseFloat(ride.longitude);
        const driverLat = parseFloat(ride.latitude);
        let driverCoords = driverLng && driverLat ? [driverLng, driverLat] : null;

        const cacheKey = `${ride.id}-${driverLng}-${driverLat}-${ride.driver_current_location || ""}-${status}`;

        if (!newRoutesData[cacheKey]) {
          const pickup = await geocodeLocation(ride.pickup_location);
          const dropoff = await geocodeLocation(ride.dropoff_location);
          
          // Fallback geocoding for driver current location if database coordinates are null
          if (!driverCoords && ride.driver_current_location) {
            driverCoords = await geocodeLocation(ride.driver_current_location);
          }

          let start = null;
          let end = null;

          if (status === "accepted" || status === "emergency") {
            start = driverCoords;
            end = pickup;
          } else if (status === "active") {
            start = pickup; // Active ride route starts at original pickup location
            end = dropoff;  // and connects to dropoff destination
          } else {
            start = pickup;
            end = dropoff;
          }

          let geometry = null;
          if (start && end) {
            try {
              const mapboxApiUrl = import.meta.env.VITE_MAPBOX_API_URL || "https://api.mapbox.com";
              const url = `${mapboxApiUrl}/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}.json?access_token=${MAPBOX_TOKEN}&geometries=geojson`;
              const res = await axios.get(url);
              if (res.data?.routes && res.data.routes.length > 0) {
                geometry = res.data.routes[0].geometry;
              }
            } catch (err) {
              console.error("Directions API error for ride", ride.id, err);
            }
          }

          newRoutesData[cacheKey] = { pickup, dropoff, geometry, resolvedDriverCoords: driverCoords };
          
          // Clear older cache keys for the same ride
          Object.keys(newRoutesData).forEach((k) => {
            if (k.startsWith(`${ride.id}-`) && k !== cacheKey) {
              delete newRoutesData[k];
            }
          });

          updated = true;
        }
      }

      if (updated) {
        setRoutesData(newRoutesData);
      }
    };

    if (rides.length > 0) {
      resolveRoutes();
    }
  }, [rides]);

  // LIVE MARKERS AND ROUTE LAYERS
  useEffect(() => {
    if (!map.current) return;

    const drawMapLayers = () => {
      if (!map.current) return;

      // REMOVE OLD MARKERS
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Clean up previous route layers and sources
      routeLayersRef.current.forEach((id) => {
        if (map.current.getLayer(`route-${id}`)) {
          map.current.removeLayer(`route-${id}`);
        }
        if (map.current.getSource(`route-source-${id}`)) {
          map.current.removeSource(`route-source-${id}`);
        }
      });
      routeLayersRef.current = [];

      if (driversOnly) {
        const driversList = allDrivers.length > 0 ? allDrivers : rides;
        driversList.forEach((d) => {
          const dStatus = (d.status || d.driver_status || "").toLowerCase().trim();
          if (dStatus === "offline" || dStatus === "blocked") {
            return;
          }

          let dLng = parseFloat(d.longitude);
          let dLat = parseFloat(d.latitude);
          let dCoords = dLng && dLat ? [dLng, dLat] : null;

          if (!dCoords && d.current_location) {
            const locKey = d.current_location.toLowerCase();
            for (const [cityName, coords] of Object.entries(SRI_LANKA_CITIES)) {
              if (locKey.includes(cityName)) {
                dCoords = coords;
                break;
              }
            }
          }

          if (dCoords) {
            const el = document.createElement("div");
            el.className = "w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white text-base animate-pulse cursor-pointer";
            
            const getEmoji = (vType) => {
              const t = (vType || "car").toLowerCase();
              if (t.includes("bike") || t.includes("motorcycle")) return "🏍️";
              if (t.includes("van") || t.includes("suv")) return "🚐";
              if (t.includes("three") || t.includes("rickshaw") || t.includes("auto") || t.includes("tuk")) return "🛺";
              return "🚗";
            };
            el.innerHTML = getEmoji(d.vehicle_type);

            const dMarker = new mapboxgl.Marker(el)
              .setLngLat(dCoords)
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div style="padding:5px; font-family:sans-serif; font-size:12px; min-width: 155px;">
                  <strong style="color:#2563eb; font-size:13px;">🚗 Live Active Driver</strong>
                  <p style="margin:4px 0 2px 0;">👤 Driver: <strong>${d.name || d.driver_name || ("Driver #" + (d.id || d.driver_id))}</strong></p>
                  <p style="margin:2px 0; color:#059669;">🟢 Status: <strong>${dStatus.toUpperCase()}</strong></p>
                  <p style="margin:2px 0; color:#4b5563; font-size:11px;">📍 ${d.current_location || "Live GPS"}</p>
                </div>
              `))
              .addTo(map.current);
            markersRef.current.push(dMarker);
          }
        });
        return;
      }

      rides.forEach((ride) => {
        const status = ride.status?.toLowerCase().trim();
        
        // Remove from map if completed and payment complete
        if (status === "completed" && ride.payment_status?.toLowerCase() === "completed") {
          return;
        }

        const driverLng = parseFloat(ride.longitude);
        const driverLat = parseFloat(ride.latitude);
        let driverCoords = driverLng && driverLat ? [driverLng, driverLat] : null;

        const cacheKey = `${ride.id}-${driverLng}-${driverLat}-${ride.driver_current_location || ""}-${status}`;
        const rData = routesData[cacheKey];

        if (!driverCoords && rData && rData.resolvedDriverCoords) {
          driverCoords = rData.resolvedDriverCoords;
        }

        // 1. PENDING: Show user location with yellow location symbol
        if (status === "pending") {
          if (rData && rData.pickup) {
            const marker = new mapboxgl.Marker({ color: "#eab308" })
              .setLngLat(rData.pickup)
              .setPopup(new mapboxgl.Popup({ offset: 35 }).setHTML(`
                <div style="padding:5px; font-family:sans-serif; font-size:12px; min-width: 150px;">
                  <strong style="color:#b45309; font-size:13px;">⏳ Pending Ride #${ride.id}</strong>
                  <p style="margin:4px 0 2px 0;">👤 User: <strong>${ride.user_name || "Unknown"}</strong></p>
                  <p style="margin:2px 0; color:#4b5563; font-size:11px;">📍 Location: ${ride.pickup_location}</p>
                </div>
              `))
              .addTo(map.current);
            markersRef.current.push(marker);
          }
          return;
        }

        // 2. EMERGENCY: Show user location/driver location with red, alert popup and flash effect
        if (status === "emergency") {
          if (rData && rData.pickup) {
            const uEl = document.createElement("div");
            uEl.className = "w-8 h-8 bg-red-650 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white font-extrabold animate-ping cursor-pointer";
            uEl.innerHTML = "🆘";

            const uMarker = new mapboxgl.Marker(uEl)
              .setLngLat(rData.pickup)
              .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
                <div style="padding:5px; font-family:sans-serif; font-size:12px; border-left:3px solid #dc2626; min-width:160px;">
                  <strong style="color:#dc2626; font-size:13px;">🚨 SOS EMERGENCY REPORT</strong>
                  <p style="margin:4px 0 2px 0;">👤 User: <strong>${ride.user_name || "Unknown"}</strong></p>
                  <p style="margin:2px 0; color:#4b5563; font-size:11px;">📍 Location: ${ride.pickup_location}</p>
                </div>
              `))
              .addTo(map.current);
            markersRef.current.push(uMarker);
          }

          if (driverCoords) {
            const dEl = document.createElement("div");
            dEl.className = "w-9 h-9 bg-red-700 rounded-full border-4 border-red-200 shadow-2xl flex items-center justify-center text-white text-base animate-pulse cursor-pointer";
            dEl.innerHTML = "🚨";

            const dMarker = new mapboxgl.Marker(dEl)
              .setLngLat(driverCoords)
              .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(`
                <div style="padding:5px; font-family:sans-serif; font-size:12px; min-width: 150px;">
                  <strong style="color:#dc2626;">🚨 Emergency Driver</strong>
                  <p style="margin:4px 0 2px 0;">🚗 Driver: ${ride.driver_name || "Unknown"}</p>
                  <p style="margin:2px 0; font-size:11px; color:#4b5563;">🚨 Action required immediately</p>
                </div>
              `))
              .addTo(map.current);
            markersRef.current.push(dMarker);
          }

          if (rData && rData.geometry) {
            const layerId = `route-${ride.id}`;
            const sourceId = `route-source-${ride.id}`;

            map.current.addSource(sourceId, {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: rData.geometry
              }
            });

            map.current.addLayer({
              id: layerId,
              type: "line",
              source: sourceId,
              layout: {
                "line-join": "round",
                "line-cap": "round"
              },
              paint: {
                "line-color": "#dc2626",
                "line-width": 8,
                "line-opacity": 0.95
              }
            });

            routeLayersRef.current.push(ride.id);
          }
          return;
        }

        // 3. COMPLETED (and payment pending): Show user location with blue color
        if (status === "completed") {
          if (rData && rData.dropoff) {
            const el = document.createElement("div");
            el.className = "w-7 h-7 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-sm cursor-pointer";
            el.innerHTML = "👤";

            const marker = new mapboxgl.Marker(el)
              .setLngLat(rData.dropoff)
              .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
                <div style="padding:5px; font-family:sans-serif; font-size:12px; min-width:165px;">
                  <strong style="color:#2563eb; font-size:13px;">🏁 Completed Ride #${ride.id}</strong>
                  <p style="margin:4px 0 2px 0;">👤 User: <strong>${ride.user_name || "Unknown"}</strong></p>
                  <p style="margin:2px 0; color:#dc2626; font-size:11px; font-weight:bold;">💵 Payment Status: PENDING</p>
                </div>
              `))
              .addTo(map.current);
            markersRef.current.push(marker);
          }
          return;
        }

        // 4. ACCEPTED: Show user (pickup) & driver location with route connecting them
        if (status === "accepted") {
          if (driverCoords) {
            const dEl = document.createElement("div");
            dEl.className = "w-7 h-7 bg-indigo-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs cursor-pointer";
            dEl.innerHTML = "🚗";

            const dMarker = new mapboxgl.Marker(dEl)
              .setLngLat(driverCoords)
              .addTo(map.current);
            markersRef.current.push(dMarker);
          }

          if (rData && rData.pickup) {
            const uEl = document.createElement("div");
            uEl.className = "w-7 h-7 bg-indigo-500 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-sm cursor-pointer";
            uEl.innerHTML = "👤";

            const uMarker = new mapboxgl.Marker(uEl)
              .setLngLat(rData.pickup)
              .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(`
                <div style="padding:5px; font-family:sans-serif; font-size:12px; min-width: 155px;">
                  <strong style="color:#4f46e5; font-size:13px;">🤝 Accepted Ride #${ride.id}</strong>
                  <p style="margin:4px 0 2px 0;">👤 User: <strong>${ride.user_name || "Unknown"}</strong></p>
                  <p style="margin:2px 0; color:#6b7280; font-size:11px;">⏳ Driver is arriving to pickup</p>
                </div>
              `))
              .addTo(map.current);
            markersRef.current.push(uMarker);
          }

          if (rData && rData.geometry) {
            const layerId = `route-${ride.id}`;
            const sourceId = `route-source-${ride.id}`;

            map.current.addSource(sourceId, {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: rData.geometry
              }
            });

            map.current.addLayer({
              id: layerId,
              type: "line",
              source: sourceId,
              layout: {
                "line-join": "round",
                "line-cap": "round"
              },
              paint: {
                "line-color": "#6366f1",
                "line-width": 5,
                "line-opacity": 0.8
              }
            });

            routeLayersRef.current.push(ride.id);
          }
          return;
        }

        // 5. ACTIVE: Show user location (pickup) & destination dropoff with green pins, connected with green route. Also overlay driver's live marker.
        if (status === "active") {
          // Green pickup pin (User Location)
          if (rData && rData.pickup) {
            const pMarker = new mapboxgl.Marker({ color: "#10b981" })
              .setLngLat(rData.pickup)
              .setPopup(new mapboxgl.Popup({ offset: 35 }).setHTML(`
                <div style="padding:5px; font-family:sans-serif; font-size:12px; min-width: 155px;">
                  <strong style="color:#059669; font-size:13px;">📍 Active Ride Origin (User)</strong>
                  <p style="margin:4px 0 2px 0;">👤 User: <strong>${ride.user_name || "Unknown"}</strong></p>
                  <p style="margin:2px 0; color:#4b5563; font-size:11px;">📍 From: ${ride.pickup_location}</p>
                </div>
              `))
              .addTo(map.current);
            markersRef.current.push(pMarker);
          }

          // Green destination pin (Drop-off)
          if (rData && rData.dropoff) {
            const dMarker = new mapboxgl.Marker({ color: "#10b981" })
              .setLngLat(rData.dropoff)
              .setPopup(new mapboxgl.Popup({ offset: 35 }).setHTML(`
                <div style="padding:5px; font-family:sans-serif; font-size:11px;">
                  <strong>Destination (Ride #${ride.id})</strong>
                  <p style="margin:2px 0; color:#4b5563;">🏁 To: ${ride.dropoff_location}</p>
                </div>
              `))
              .addTo(map.current);
            markersRef.current.push(dMarker);
          }

          // Green route line
          if (rData && rData.geometry) {
            const layerId = `route-${ride.id}`;
            const sourceId = `route-source-${ride.id}`;

            map.current.addSource(sourceId, {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: rData.geometry
              }
            });

            map.current.addLayer({
              id: layerId,
              type: "line",
              source: sourceId,
              layout: {
                "line-join": "round",
                "line-cap": "round"
              },
              paint: {
                "line-color": "#10b981",
                "line-width": 6,
                "line-opacity": 0.8
              }
            });

            routeLayersRef.current.push(ride.id);
          }
          return;
        }
      });
    };

    if (map.current.isStyleLoaded()) {
      drawMapLayers();
    } else {
      map.current.once("load", drawMapLayers);
    }

    // Cleanup layers on re-render
    return () => {
      if (map.current) {
        routeLayersRef.current.forEach((id) => {
          if (map.current.getLayer(`route-${id}`)) {
            map.current.removeLayer(`route-${id}`);
          }
          if (map.current.getSource(`route-source-${id}`)) {
            map.current.removeSource(`route-source-${id}`);
          }
        });
      }
    };
  }, [rides, routesData, driversOnly]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[85vh] rounded-2xl overflow-hidden shadow-md"
    />
  );
};

export default LiveMap;

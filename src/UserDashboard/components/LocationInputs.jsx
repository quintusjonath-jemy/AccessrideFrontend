import { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, ArrowUpDown } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const COLOMBO_LNG = 79.8612;
const COLOMBO_LAT = 6.9271;

const LocationInputs = ({ pickup, dropoff, onChangePickup, onChangeDropoff, onSwap, isLocating = false, userCoords = null, onRequestGPS = null }) => {
  // Use user's GPS position as proximity for suggestions; fall back to Colombo
  const [proxLng, proxLat] = userCoords || [COLOMBO_LNG, COLOMBO_LAT];
  const [localPickup, setLocalPickup] = useState(pickup);
  const [localDropoff, setLocalDropoff] = useState(dropoff);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showPickupList, setShowPickupList] = useState(false);
  const [showDropoffList, setShowDropoffList] = useState(false);
  const [isTypingPickup, setIsTypingPickup] = useState(false);
  const [isTypingDropoff, setIsTypingDropoff] = useState(false);

  // Sync local states when external props change (e.g. initial load or swap)
  useEffect(() => {
    setLocalPickup(pickup);
  }, [pickup]);

  useEffect(() => {
    setLocalDropoff(dropoff);
  }, [dropoff]);

  // Debounced search for Pickup Suggestions (Restricted to Sri Lanka)
  useEffect(() => {
    if (!isTypingPickup || !localPickup || localPickup.trim().length < 2) {
      setPickupSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(localPickup)}.json?access_token=${MAPBOX_TOKEN}&country=lk&proximity=${proxLng},${proxLat}&autocomplete=true&limit=5`;
        const res = await axios.get(url);
        if (res.data?.features) {
          setPickupSuggestions(res.data.features.map(f => f.place_name));
        }
      } catch (err) {
        console.error("Error fetching pickup suggestions:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [localPickup, isTypingPickup]);

  // Debounced search for Dropoff Suggestions (Restricted to Sri Lanka)
  useEffect(() => {
    if (!isTypingDropoff || !localDropoff || localDropoff.trim().length < 2) {
      setDropoffSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(localDropoff)}.json?access_token=${MAPBOX_TOKEN}&country=lk&proximity=${proxLng},${proxLat}&autocomplete=true&limit=5`;
        const res = await axios.get(url);
        if (res.data?.features) {
          setDropoffSuggestions(res.data.features.map(f => f.place_name));
        }
      } catch (err) {
        console.error("Error fetching dropoff suggestions:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [localDropoff, isTypingDropoff]);

  const handlePickupChange = (value) => {
    setLocalPickup(value);
    setIsTypingPickup(true);
    setShowPickupList(true);
  };

  const handleDropoffChange = (value) => {
    setLocalDropoff(value);
    setIsTypingDropoff(true);
    setShowDropoffList(true);
  };

  const selectPickupSuggestion = (val) => {
    setLocalPickup(val);
    onChangePickup(val);
    setIsTypingPickup(false);
    setPickupSuggestions([]);
    setShowPickupList(false);
  };

  const selectDropoffSuggestion = (val) => {
    setLocalDropoff(val);
    onChangeDropoff(val);
    setIsTypingDropoff(false);
    setDropoffSuggestions([]);
    setShowDropoffList(false);
  };

  const handleSwap = () => {
    setIsTypingPickup(false);
    setIsTypingDropoff(false);
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
    onSwap();
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative flex items-center gap-3">
      {/* Visual timeline/dots line on the left */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center">
          <div className="h-1 w-1 rounded-full bg-emerald-500" />
        </div>
        <div className="w-0.5 h-10 border-l-2 border-dotted border-slate-300" />
        <MapPin size={18} className="text-red-500" />
      </div>

      {/* Input columns */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Pickup Input */}
        <div className="relative">
          <input
            type="text"
            value={localPickup}
            onChange={(e) => handlePickupChange(e.target.value)}
            onFocus={() => setShowPickupList(true)}
            onBlur={() => {
              setTimeout(() => {
                setShowPickupList(false);
                onChangePickup(localPickup);
              }, 250);
            }}
            placeholder="Pickup Location"
            className="w-full py-1 text-sm text-[#0B2F89] font-medium outline-none placeholder:text-gray-400 placeholder:font-normal"
          />
          {/* GPS button — visible when field is empty and GPS is supported */}
          {!localPickup && onRequestGPS && (
            <button
              type="button"
              onClick={onRequestGPS}
              disabled={isLocating}
              className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-[#0B2F89] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full hover:bg-blue-100 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {isLocating ? (
                <>
                  <span className="inline-block w-2.5 h-2.5 border border-[#0B2F89] border-t-transparent rounded-full animate-spin" />
                  <span>Detecting…</span>
                </>
              ) : (
                <>
                  <span>📍</span>
                  <span>Use My Location</span>
                </>
              )}
            </button>
          )}
          {showPickupList && pickupSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-8 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-50">
              {pickupSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => selectPickupSuggestion(sug)}
                  className="px-4 py-2.5 hover:bg-slate-50 text-xs text-slate-700 cursor-pointer transition flex items-center gap-2"
                >
                  <span className="text-slate-400 shrink-0">📍</span>
                  <span className="truncate">{sug}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider line between inputs */}
        <div className="h-px bg-slate-100 w-full" />

        {/* Dropoff Input */}
        <div className="relative">
          <input
            type="text"
            value={localDropoff}
            onChange={(e) => handleDropoffChange(e.target.value)}
            onFocus={() => setShowDropoffList(true)}
            onBlur={() => {
              setTimeout(() => {
                setShowDropoffList(false);
                onChangeDropoff(localDropoff);
              }, 250);
            }}
            placeholder="Where to?"
            className="w-full py-1 text-sm text-[#0B2F89] font-semibold outline-none placeholder:text-gray-400 placeholder:font-normal"
          />
          {showDropoffList && dropoffSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-8 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-50">
              {dropoffSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => selectDropoffSuggestion(sug)}
                  className="px-4 py-2.5 hover:bg-slate-50 text-xs text-slate-700 cursor-pointer transition flex items-center gap-2"
                >
                  <span className="text-slate-400 shrink-0">🏁</span>
                  <span className="truncate">{sug}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swap Button */}
      <button
        type="button"
        onClick={handleSwap}
        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0B2F89] transition cursor-pointer"
        title="Swap locations"
      >
        <ArrowUpDown size={18} />
      </button>
    </div>
  );
};

export default LocationInputs;

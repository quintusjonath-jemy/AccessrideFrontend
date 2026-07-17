import React, { useEffect, useState, useRef } from "react";
import { Peer } from "peerjs";
import { FiPhone, FiPhoneOff, FiAlertTriangle } from "react-icons/fi";

const VoiceCallReceiver = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [peerError, setPeerError] = useState(null);
  const [callerName, setCallerName] = useState("Passenger");

  const peerRef = useRef(null);
  const audioStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Initialize PeerJS
    const peer = new Peer("accessride-admin-emergency");
    peerRef.current = peer;

    peer.on("open", (id) => {
      console.log("Admin Emergency WebRTC connected. Peer ID:", id);
      setPeerError(null);
    });

    peer.on("call", (call) => {
      console.log("Incoming WebRTC call from passenger...");
      // Retrieve metadata/name from metadata field in PeerJS call options
      const riderName = call.metadata?.name || "Passenger";
      setCallerName(riderName);
      setIncomingCall(call);

      // Play ringing sound dynamically using Web Audio API
      let stopRingingFn = null;
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        const startRing = () => {
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc1.frequency.value = 400;
          osc2.frequency.value = 450;
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc1.start();
          osc2.start();
          
          setTimeout(() => {
            try { osc1.stop(); osc2.stop(); } catch(e){}
          }, 1500);
        };
        
        startRing();
        ringIntervalRef.current = setInterval(startRing, 3000);
        
        stopRingingFn = () => {
          clearInterval(ringIntervalRef.current);
          try { audioCtx.close(); } catch(e){}
        };
      } catch (err) {
        console.error("Audio Context error:", err);
      }
      
      call.on("close", () => {
        if (stopRingingFn) stopRingingFn();
        handleHangUp();
      });

      call.on("error", (err) => {
        if (stopRingingFn) stopRingingFn();
        handleHangUp();
      });

      // Attach stop function
      call.stopRinging = stopRingingFn;
    });

    peer.on("error", (err) => {
      console.error("PeerJS Admin error:", err);
      if (err.type === "unavailable-id") {
        // ID already in use (e.g. another admin tab is open)
        setPeerError("Unavailable: Emergency receiver is already open in another browser tab.");
      } else {
        setPeerError("Emergency WebRTC disconnected: " + err.message);
      }
    });

    return () => {
      peer.destroy();
      clearInterval(ringIntervalRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const handleAnswer = async () => {
    if (!incomingCall) return;
    
    // Stop ringtone
    if (incomingCall.stopRinging) {
      incomingCall.stopRinging();
    }

    try {
      // Get Admin Mic stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      incomingCall.answer(stream);
      setActiveCall(incomingCall);
      setIncomingCall(null);

      incomingCall.on("stream", (remoteStream) => {
        // Play remote audio
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
      });

      // Start Call Timer
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Failed to get microphone stream:", err);
      alert("Microphone permission is required to answer the call.");
      handleDecline();
    }
  };

  const handleDecline = () => {
    if (incomingCall) {
      if (incomingCall.stopRinging) {
        incomingCall.stopRinging();
      }
      incomingCall.close();
      setIncomingCall(null);
    }
  };

  const handleHangUp = () => {
    clearInterval(timerRef.current);
    if (activeCall) {
      activeCall.close();
      setActiveCall(null);
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    setCallDuration(0);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
      <audio ref={remoteAudioRef} className="hidden" />

      {/* Incoming Call Dialog Overlay */}
      {incomingCall && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-100 dark:border-red-900/30 text-center transform scale-100 transition-all">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FiPhone className="text-red-600 dark:text-red-400 h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Emergency Call</h3>
            <p className="text-slate-600 dark:text-slate-300 mt-2 font-medium">
              Incoming call from <span className="text-red-600 font-bold">{callerName}</span>
            </p>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleDecline}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <FiPhoneOff className="h-5 w-5" /> Decline
              </button>
              <button
                onClick={handleAnswer}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
              >
                <FiPhone className="h-5 w-5" /> Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call UI HUD */}
      {activeCall && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl z-[9998] border border-emerald-500/30 w-72 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
              <FiPhone className="text-emerald-400 h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[14px] leading-tight">{callerName}</p>
              <p className="text-slate-400 text-[12px] mt-0.5">Connected: {formatTime(callDuration)}</p>
            </div>
          </div>
          <button
            onClick={handleHangUp}
            className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition"
          >
            <FiPhoneOff className="text-white h-5 w-5" />
          </button>
        </div>
      )}

      {/* Connection error warnings/badges */}
      {peerError && (
        <div className="fixed bottom-6 left-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 shadow-lg z-[9997] max-w-xs flex items-start gap-2.5">
          <FiAlertTriangle className="text-amber-600 dark:text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-800 dark:text-amber-300 leading-normal font-medium">{peerError}</p>
        </div>
      )}
    </>
  );
};

export default VoiceCallReceiver;

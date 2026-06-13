// Voice Recognition
function startListening() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.start();

  recognition.onresult = function(event) {
    let text = event.results[0][0].transcript.toLowerCase();
    document.getElementById("status").innerText = text;

    if (text.includes("help")) {
      sendSOS();
    }
  };
}

// Send SOS
function sendSOS() {
  document.getElementById("messageBox").classList.remove("hidden");

  // Get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Get user_id from localStorage or session
        const user_id = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
        const driver_id = localStorage.getItem("driver_id") || sessionStorage.getItem("driver_id") || null;

        const sosData = {
          user_id: user_id,
          driver_id: driver_id,
          latitude: latitude,
          longitude: longitude
        };

        fetch("http://localhost/AccessrideBackend/Emergency/sos.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(sosData)
        })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          alert(data.message);
        })
        .catch(err => {
          console.error("Error:", err);
          alert("Failed to send SOS");
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Could not get location. Please enable location services.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser");
  }
}

// Cancel SOS
function cancelSOS() {
  document.getElementById("messageBox").classList.add("hidden");
  alert("SOS Cancelled");
}
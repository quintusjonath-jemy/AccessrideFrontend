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

  fetch("backend/sos.php", {
    method: "POST"
  })
  .then(res => res.text())
  .then(data => {
    console.log(data);
  });
}

// Cancel SOS
function cancelSOS() {
  document.getElementById("messageBox").classList.add("hidden");
  alert("SOS Cancelled");
}
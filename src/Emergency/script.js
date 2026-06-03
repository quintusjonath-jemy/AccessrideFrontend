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

  fetch("http://localhost/AccessrideBackend/sos.php", {
    method: "POST"
  })
  .then(res => res.json()) // better than text
  .then(data => {
    console.log(data);
    alert(data.message); // show response
  })
  .catch(err => {
    console.error("Error:", err);
  });
}

// Cancel SOS
function cancelSOS() {
  document.getElementById("messageBox").classList.add("hidden");
  alert("SOS Cancelled");
}
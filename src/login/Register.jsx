import React, { useState, useEffect, useRef } from "react";
import { UserPlus, Mic, MicOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { speakWithFallback } from "../UserDashboard/components/voiceassistant/VoiceAssistant";
import API_BASE from "../config/api";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const backendBase = `${API_BASE}/login`;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    guardianName: "",
    guardianNumber: "",
    agree: false,
  });

  // Sync ref to prevent stale closures inside async event handlers
  const formDataRef = useRef({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    guardianName: "",
    guardianNumber: "",
    agree: false,
  });

  // Voice Guidance States
  const [voiceStep, setVoiceStep] = useState("idle"); // idle | firstName | lastName | email | phone | guardianName | guardianNumber | password | confirmPassword | confirm
  const voiceStepRef = useRef("idle");
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Tap to use Voice Registration");
  const recognitionRef = useRef(null);

  // Trigger voice registration on redirect or mount
  useEffect(() => {
    if (location.state?.voiceStart) {
      speakWithFallback(
        "Welcome to AccessRide Registration. Let's create your account. Please state your first name.",
        null,
        () => {
          voiceStepRef.current = "firstName";
          setVoiceStep("firstName");
          startListeningForStep("firstName");
        }
      );
    } else {
      speakWithFallback(
        "Welcome to AccessRide Registration. If you need voice guidance, please tap the yellow microphone button at the bottom of the page."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: finalValue,
      };
      formDataRef.current = next;
      return next;
    });
  };

  const handleRegister = async () => {
    const data = formDataRef.current;
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      guardianName,
      guardianNumber,
      agree,
    } = data;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      speakWithFallback("Please fill all required fields.");
      alert("Please fill all required fields");
      return;
    }

    if (!guardianName || !guardianNumber) {
      speakWithFallback("Please fill in emergency contact details.");
      alert("Please fill all required fields including guardian details");
      return;
    }

    if (password.length < 8) {
      speakWithFallback("Password must be at least 8 characters.");
      alert("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      speakWithFallback("Passwords do not match.");
      alert("Passwords do not match");
      return;
    }

    if (!agree) {
      speakWithFallback("You must agree to the terms.");
      alert("You must agree to the terms");
      return;
    }

    try {
      const response = await fetch(`${backendBase}/api/register.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
      } else {
        const text = await response.text();
        const cleanText = text.replace(/<[^>]*>/g, '').trim();
        throw new Error(cleanText || "Server error occurred");
      }

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      speakWithFallback("Registration successful. Opening login page.");
      alert(result.message || `Registration successful for ${firstName} ${lastName}.`);
      navigate("/login");
    } catch (error) {
      const errMsg = error.message;
      speakWithFallback(`Registration failed. ${errMsg}. Let's try again. State your first name.`, null, () => {
        voiceStepRef.current = "firstName";
        setVoiceStep("firstName");
        startListeningForStep("firstName");
      });
      alert(errMsg);
    }
  };

  const cleanSpokenEmail = (text) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "") // remove all spaces
      .replace(/at/g, "@")
      .replace(/and/g, "@") // replace common transcription errors
      .replace(/an/g, "@")
      .replace(/dot/g, ".");
  };

  const handleVoiceInput = (text) => {
    const cleanText = text.toLowerCase().trim();
    const currentStep = voiceStepRef.current;

    const updateField = (name, value) => {
      setFormData((prev) => {
        const next = { ...prev, [name]: value };
        formDataRef.current = next;
        return next;
      });
    };

    if (currentStep === "firstName") {
      const name = text.trim();
      updateField("firstName", name);
      speakWithFallback(`First name set to ${name}. What is your last name?`, null, () => {
        voiceStepRef.current = "lastName";
        setVoiceStep("lastName");
        startListeningForStep("lastName");
      });
    } else if (currentStep === "lastName") {
      const name = text.trim();
      updateField("lastName", name);
      speakWithFallback(`Last name set to ${name}. What is your email address?`, null, () => {
        voiceStepRef.current = "email";
        setVoiceStep("email");
        startListeningForStep("email");
      });
    } else if (currentStep === "email") {
      const emailVal = cleanSpokenEmail(text);
      updateField("email", emailVal);
      speakWithFallback(`Email set to ${emailVal.split("").join(" ")}. What is your phone number?`, null, () => {
        voiceStepRef.current = "phone";
        setVoiceStep("phone");
        startListeningForStep("phone");
      });
    } else if (currentStep === "phone") {
      const phoneVal = cleanText.replace(/\s+/g, ""); // remove spaces
      updateField("phone", phoneVal);
      speakWithFallback(`Phone number set to ${phoneVal.split("").join(" ")}. What is your emergency contact's name?`, null, () => {
        voiceStepRef.current = "guardianName";
        setVoiceStep("guardianName");
        startListeningForStep("guardianName");
      });
    } else if (currentStep === "guardianName") {
      const gName = text.trim();
      updateField("guardianName", gName);
      speakWithFallback(`Emergency contact set to ${gName}. What is their phone number?`, null, () => {
        voiceStepRef.current = "guardianNumber";
        setVoiceStep("guardianNumber");
        startListeningForStep("guardianNumber");
      });
    } else if (currentStep === "guardianNumber") {
      const gPhone = cleanText.replace(/\s+/g, ""); // remove spaces
      updateField("guardianNumber", gPhone);
      speakWithFallback("Great. Choose a password of 8 or more characters.", null, () => {
        voiceStepRef.current = "password";
        setVoiceStep("password");
        startListeningForStep("password");
      });
    } else if (currentStep === "password") {
      const pass = cleanText.replace(/\s+/g, ""); // remove spaces
      if (pass.length < 8) {
        speakWithFallback("Password must be at least 8 characters. Please state your password again.", null, () => {
          startListeningForStep("password");
        });
        return;
      }
      updateField("password", pass);
      speakWithFallback("Please repeat your password to confirm.", null, () => {
        voiceStepRef.current = "confirmPassword";
        setVoiceStep("confirmPassword");
        startListeningForStep("confirmPassword");
      });
    } else if (currentStep === "confirmPassword") {
      const confirmPass = cleanText.replace(/\s+/g, ""); // remove spaces
      const originalPass = formDataRef.current.password;
      if (confirmPass !== originalPass) {
        speakWithFallback("Passwords do not match. Please choose a password again.", null, () => {
          voiceStepRef.current = "password";
          setVoiceStep("password");
          startListeningForStep("password");
        });
        return;
      }
      updateField("confirmPassword", confirmPass);
      updateField("agree", true); // Auto agree on voice registration!
      speakWithFallback("Passwords match. Say register to complete registration, or clear to reset.", null, () => {
        voiceStepRef.current = "confirm";
        setVoiceStep("confirm");
        startListeningForStep("confirm");
      });
    } else if (currentStep === "confirm") {
      if (cleanText.includes("register") || cleanText.includes("submit") || cleanText.includes("yes")) {
        voiceStepRef.current = "idle";
        setVoiceStep("idle");
        handleRegister();
      } else if (cleanText.includes("clear") || cleanText.includes("reset") || cleanText.includes("start over")) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          guardianName: "",
          guardianNumber: "",
          agree: false,
        });
        formDataRef.current = {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          guardianName: "",
          guardianNumber: "",
          agree: false,
        };
        voiceStepRef.current = "idle";
        setVoiceStep("idle");
        speakWithFallback("Form cleared. Tap the mic button to start over.");
      } else {
        speakWithFallback("Say register to complete registration, or clear to reset.");
      }
    }
  };

  const startListeningForStep = (step) => {
    if (!SpeechRecognition) return;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setVoiceStatus(
        step === "firstName" ? "Say your first name..." :
        step === "lastName" ? "Say your last name..." :
        step === "email" ? "Say your email..." :
        step === "phone" ? "Say your phone number..." :
        step === "guardianName" ? "Say emergency contact name..." :
        step === "guardianNumber" ? "Say emergency contact number..." :
        step === "password" ? "Say password..." :
        step === "confirmPassword" ? "Say password again..." :
        "Say register..."
      );
    };

    rec.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      handleVoiceInput(spokenText);
    };

    rec.onerror = () => {
      setIsListening(false);
      setVoiceStatus("Voice error. Tap mic to retry.");
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const startVoiceRegistrationWizard = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    voiceStepRef.current = "firstName";
    setVoiceStep("firstName");
    speakWithFallback("Voice registration activated. Please state your first name.", null, () => {
      startListeningForStep("firstName");
    });
  };

  const voiceReadForm = () => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis not supported");
      return;
    }

    const fields = [
      `First Name: ${formData.firstName || "empty"}`,
      `Last Name: ${formData.lastName || "empty"}`,
      `Email: ${formData.email || "empty"}`,
      `Phone: ${formData.phone || "empty"}`,
      `Guardian Name: ${formData.guardianName || "empty"}`,
      `Guardian Number: ${formData.guardianNumber || "empty"}`,
      `Password: ${formData.password ? "set" : "not set"}`,
    ];

    let index = 0;

    const speakNext = () => {
      if (index >= fields.length) return;

      const utterance = new SpeechSynthesisUtterance(fields[index]);

      utterance.onend = () => {
        index++;
        speakNext();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 to-gray-200 flex items-center justify-center p-6">
      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 bg-blue-900 rounded-2xl flex items-center justify-center">
                <UserPlus className="text-white" size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-blue-900">
                  Create Your Account
                </h1>
                <p className="text-gray-600 ">
                  Enjoy a personalized ride experience with AccessRide. Sign up now to get started!
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="text-blue-900 font-medium hover:underline"
            >
              Back to Sign In
            </Link>
          </header>

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-900 font-semibold mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-blue-900 font-semibold mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +94 123456789"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900"
              />
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-900 font-semibold mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-blue-900 font-semibold mb-1">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    name="guardianNumber"
                    value={formData.guardianNumber}
                    onChange={handleChange}
                    placeholder="e.g. +94 123456789"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                className="h-4 w-4"
              />

              <label className="text-sm text-gray-600">
                I agree to the AccessRide terms and privacy
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800"
            >
              Create Account
            </button>
              <div className="flex flex-col items-center mt-4">
                <button
                  type="button"
                  onClick={startVoiceRegistrationWizard}
                  className={`w-24 h-24 rounded-full shadow-lg flex items-center justify-center transition-all cursor-pointer ${
                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-yellow-400 hover:bg-yellow-300 text-yellow-900"
                  }`}
                >
                  {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                </button>

                <span className="text-blue-900 font-semibold text-xl mt-4">
                  {voiceStatus}
                </span>
              </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Register;
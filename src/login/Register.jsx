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
    homeAddress: "",
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
    homeAddress: "",
    password: "",
    confirmPassword: "",
    guardianName: "",
    guardianNumber: "",
    agree: false,
  });

  // Voice Guidance States
  const [voiceStep, setVoiceStep] = useState("idle"); // idle | firstName | lastName | email | phone | homeAddress | guardianName | guardianNumber | password | confirmPassword | confirm
  const voiceStepRef = useRef("idle");
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Tap to use Voice Registration");
  const recognitionRef = useRef(null);

  const REGISTER_STEPS = [
    { step: "firstName", key: "firstName", label: "first name", prompt: "Please state your first name." },
    { step: "lastName", key: "lastName", label: "last name", prompt: "What is your last name?" },
    { step: "email", key: "email", label: "email address", prompt: "What is your email address?" },
    { step: "phone", key: "phone", label: "phone number", prompt: "What is your phone number?" },
    { step: "homeAddress", key: "homeAddress", label: "home address", prompt: "What is your home address?" },
    { step: "guardianName", key: "guardianName", label: "emergency contact name", prompt: "What is your emergency contact's name?" },
    { step: "guardianNumber", key: "guardianNumber", label: "emergency contact phone number", prompt: "What is their phone number?" },
    { step: "password", key: "password", label: "password", prompt: "Choose a password of 8 or more characters." },
    { step: "confirmPassword", key: "confirmPassword", label: "confirm password", prompt: "Please repeat your password to confirm." }
  ];

  function getNextEmptyStep(currentData, startStepName = null) {
    let startIndex = 0;
    if (startStepName) {
      const idx = REGISTER_STEPS.findIndex((s) => s.step === startStepName);
      if (idx !== -1) {
        startIndex = idx + 1;
      }
    }

    for (let i = startIndex; i < REGISTER_STEPS.length; i++) {
      const item = REGISTER_STEPS[i];
      const val = currentData[item.key];
      if (!val || (typeof val === "string" && !val.trim())) {
        return item;
      }
    }
    // Also check if any earlier field was left blank:
    for (let i = 0; i < startIndex; i++) {
      const item = REGISTER_STEPS[i];
      const val = currentData[item.key];
      if (!val || (typeof val === "string" && !val.trim())) {
        return item;
      }
    }
    return null; // All fields are filled!
  }

  function advanceToNextEmptyField(currentData, justCompletedStep, acknowledgmentText = "") {
    const nextItem = getNextEmptyStep(currentData, justCompletedStep);
    if (nextItem) {
      const msg = acknowledgmentText ? `${acknowledgmentText} ${nextItem.prompt}` : nextItem.prompt;
      speakWithFallback(msg, null, () => {
        voiceStepRef.current = nextItem.step;
        setVoiceStep(nextItem.step);
        startListeningForStep(nextItem.step);
      });
    } else {
      // All fields filled
      const msg = acknowledgmentText 
        ? `${acknowledgmentText} All fields are filled. Say register to complete registration, or clear to reset.`
        : "All fields are filled. Say register to complete registration, or clear to reset.";
      setFormData((prev) => {
        const updated = { ...prev, agree: true };
        formDataRef.current = updated;
        return updated;
      });
      speakWithFallback(msg, null, () => {
        voiceStepRef.current = "confirm";
        setVoiceStep("confirm");
        startListeningForStep("confirm");
      });
    }
  }

  function cleanSpokenEmail(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, "") // remove all spaces
      .replace(/at/g, "@")
      .replace(/and/g, "@") // replace common transcription errors
      .replace(/an/g, "@")
      .replace(/dot/g, ".");
  }

  function handleVoiceInput(text) {
    const cleanText = text.toLowerCase().trim();
    const currentStep = voiceStepRef.current;

    const updateField = (name, value) => {
      const next = { ...formDataRef.current, [name]: value };
      formDataRef.current = next;
      setFormData(next);
      return next;
    };

    if (cleanText.includes("clear") || cleanText.includes("reset") || cleanText.includes("start over")) {
      const emptyState = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        homeAddress: "",
        password: "",
        confirmPassword: "",
        guardianName: "",
        guardianNumber: "",
        agree: false,
      };
      setFormData(emptyState);
      formDataRef.current = emptyState;
      voiceStepRef.current = "firstName";
      setVoiceStep("firstName");
      speakWithFallback("Form cleared. Let's start from the beginning. Please state your first name.", null, () => {
        startListeningForStep("firstName");
      });
      return;
    }

    if (currentStep === "firstName") {
      const name = text.trim();
      const nextData = updateField("firstName", name);
      advanceToNextEmptyField(nextData, "firstName", `First name set to ${name}.`);
    } else if (currentStep === "lastName") {
      const name = text.trim();
      const nextData = updateField("lastName", name);
      advanceToNextEmptyField(nextData, "lastName", `Last name set to ${name}.`);
    } else if (currentStep === "email") {
      const emailVal = cleanSpokenEmail(text);
      const nextData = updateField("email", emailVal);
      advanceToNextEmptyField(nextData, "email", `Email set to ${emailVal.split("").join(" ")}.`);
    } else if (currentStep === "phone") {
      const phoneVal = cleanText.replace(/\s+/g, ""); // remove spaces
      const nextData = updateField("phone", phoneVal);
      advanceToNextEmptyField(nextData, "phone", "Phone number set.");
    } else if (currentStep === "homeAddress") {
      const address = text.trim();
      const nextData = updateField("homeAddress", address);
      advanceToNextEmptyField(nextData, "homeAddress", `Home address set to ${address}.`);
    } else if (currentStep === "guardianName") {
      const gName = text.trim();
      const nextData = updateField("guardianName", gName);
      advanceToNextEmptyField(nextData, "guardianName", `Emergency contact set to ${gName}.`);
    } else if (currentStep === "guardianNumber") {
      const gPhone = cleanText.replace(/\s+/g, ""); // remove spaces
      const nextData = updateField("guardianNumber", gPhone);
      advanceToNextEmptyField(nextData, "guardianNumber", "Emergency contact number set.");
    } else if (currentStep === "password") {
      const pass = cleanText.replace(/\s+/g, ""); // remove spaces
      if (pass.length < 8) {
        speakWithFallback("Password must be at least 8 characters. Please state your password again.", null, () => {
          startListeningForStep("password");
        });
        return;
      }
      const nextData = updateField("password", pass);
      advanceToNextEmptyField(nextData, "password", "Password recorded.");
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
      const nextData = updateField("confirmPassword", confirmPass);
      advanceToNextEmptyField(nextData, "confirmPassword", "Passwords match.");
    } else if (currentStep === "confirm") {
      if (cleanText.includes("register") || cleanText.includes("submit") || cleanText.includes("yes")) {
        voiceStepRef.current = "idle";
        setVoiceStep("idle");
        handleRegister();
      } else {
        speakWithFallback("Say register to complete registration, or clear to reset.");
      }
    }
  }

  function startListeningForStep(step) {
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
        step === "homeAddress" ? "Say your home address..." :
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
  }

  // Trigger voice registration on redirect or mount
  useEffect(() => {
    if (location.state?.voiceStart) {
      const currentData = formDataRef.current;
      const nextItem = getNextEmptyStep(currentData);
      if (nextItem) {
        speakWithFallback(
          `Welcome to AccessRide Registration. Let's complete your account. ${nextItem.prompt}`,
          null,
          () => {
            voiceStepRef.current = nextItem.step;
            setVoiceStep(nextItem.step);
            startListeningForStep(nextItem.step);
          }
        );
      } else {
        speakWithFallback(
          "Welcome to AccessRide Registration. All fields are filled. Say register to complete registration.",
          null,
          () => {
            voiceStepRef.current = "confirm";
            setVoiceStep("confirm");
            startListeningForStep("confirm");
          }
        );
      }
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

  async function handleRegister() {
    const data = formDataRef.current;
    const {
      firstName,
      lastName,
      email,
      phone,
      homeAddress,
      password,
      confirmPassword,
      guardianName,
      guardianNumber,
      agree,
    } = data;

    // Check for any empty field and prompt specifically for it without restarting everything
    const nextMissing = getNextEmptyStep(data);
    if (nextMissing) {
      speakWithFallback(`Please fill in your ${nextMissing.label}. ${nextMissing.prompt}`, null, () => {
        voiceStepRef.current = nextMissing.step;
        setVoiceStep(nextMissing.step);
        startListeningForStep(nextMissing.step);
      });
      alert(`Please fill in your ${nextMissing.label}`);
      return;
    }

    if (password.length < 8) {
      speakWithFallback("Password must be at least 8 characters. Please state your password.", null, () => {
        voiceStepRef.current = "password";
        setVoiceStep("password");
        startListeningForStep("password");
      });
      alert("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      speakWithFallback("Passwords do not match. Please repeat your password.", null, () => {
        voiceStepRef.current = "confirmPassword";
        setVoiceStep("confirmPassword");
        startListeningForStep("confirmPassword");
      });
      alert("Passwords do not match");
      return;
    }

    if (!agree) {
      setFormData((prev) => {
        const next = { ...prev, agree: true };
        formDataRef.current = next;
        return next;
      });
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
      // Registration problem occurred -> Start from the beginning as requested
      const emptyState = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        homeAddress: "",
        password: "",
        confirmPassword: "",
        guardianName: "",
        guardianNumber: "",
        agree: false,
      };
      setFormData(emptyState);
      formDataRef.current = emptyState;

      speakWithFallback(
        `Registration failed. ${errMsg}. Let's start from the beginning. Please state your first name.`,
        null,
        () => {
          voiceStepRef.current = "firstName";
          setVoiceStep("firstName");
          startListeningForStep("firstName");
        }
      );
      alert(errMsg);
    }
  }

  const startVoiceRegistrationWizard = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    const currentData = formDataRef.current;
    const nextItem = getNextEmptyStep(currentData);
    if (nextItem) {
      speakWithFallback(`Voice registration activated. ${nextItem.prompt}`, null, () => {
        voiceStepRef.current = nextItem.step;
        setVoiceStep(nextItem.step);
        startListeningForStep(nextItem.step);
      });
    } else {
      speakWithFallback("All fields are already filled. Say register to submit your registration, or clear to reset.", null, () => {
        voiceStepRef.current = "confirm";
        setVoiceStep("confirm");
        startListeningForStep("confirm");
      });
    }
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

            <div>
              <label className="block text-blue-900 font-semibold mb-1">
                Home Address
              </label>
              <input
                type="text"
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                placeholder="e.g. 123 Main Street, Colombo 03"
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
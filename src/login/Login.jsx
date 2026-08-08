import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Mic,
  MicOff,
  Shield,
  Headphones,
  Accessibility,
  Eye,
  EyeOff,
} from "lucide-react";
import { speakWithFallback } from "../UserDashboard/components/voiceassistant/VoiceAssistant";
import API_BASE from "../config/api";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userError, setUserError] = useState("");

  // Refs to prevent stale closures in voice event handlers
  const emailRef = useRef("");
  const passwordRef = useRef("");
  
  // Voice Guidance States
  const [voiceStep, setVoiceStep] = useState("idle"); // For UI display: idle | email | password | confirm
  const voiceStepRef = useRef("idle"); // Synchronous ref for event listeners
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Tap to use Voice Login");
  const recognitionRef = useRef(null);

  // Greet the user when they mount the login page
  useEffect(() => {
    speakWithFallback(
      "Welcome to AccessRide Login. If you need voice guidance, please tap the yellow microphone button at the bottom of the screen."
    );
  }, []);

  const loginUser = async () => {
    const currentEmail = (emailRef.current || email).trim();
    const currentPassword = (passwordRef.current || password).trim();

    if (!currentEmail || !currentPassword) {
      speakWithFallback("Please enter both email and password.");
      alert("Please enter email and password");
      return;
    }

    if (currentPassword.length < 8) {
      speakWithFallback("Password must be at least 8 characters. Please try again.");
      setUserError("Password must be at least 8 characters.");
      return;
    }

    const backendBase = `${API_BASE}/login`;

    try {
      const response = await fetch(`${backendBase}/api/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentEmail,
          password: currentPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errMsg = result.error || "Login failed";
        if (
          errMsg.toLowerCase().includes("incorrect password") ||
          errMsg.toLowerCase().includes("invalid password") ||
          errMsg.toLowerCase().includes("user not found") ||
          errMsg.toLowerCase().includes("invalid phone") ||
          errMsg.toLowerCase().includes("login failed")
        ) {
          errMsg = "Username or password invalid";
        }
        setUserError(errMsg);
        speakWithFallback(
          `Login failed. ${errMsg}. Please check your credentials and try again.`,
          null,
          () => {
            voiceStepRef.current = "confirm";
            setVoiceStep("confirm");
            startListeningForStep("confirm");
          }
        );
        return;
      }

      setUserError("");
      speakWithFallback("Login successful. Opening your dashboard.");
      localStorage.setItem("user_id", result.user.id);
      sessionStorage.setItem("user_id", result.user.id);
      
      setEmail("");
      setPassword("");
      emailRef.current = "";
      passwordRef.current = "";
      
      navigate("/user/dashboard");
    } catch (error) {
      setUserError("Unable to connect to server. Please try again.");
      speakWithFallback(
        "Server connection error. Please try again."
      );
    }
  };

  // Helper to clean up spoken emails (e.g. "john and gmail dot com" or "john at gmail..." -> "john@gmail.com")
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
    const currentEmail = (emailRef.current || email).trim();
    const currentPassword = (passwordRef.current || password).trim();

    console.log(`[VoiceLogin] Step: ${currentStep} | Heard: "${cleanText}" | Email: "${currentEmail}" | Password len: ${currentPassword.length}`);

    const isLoginIntent =
      cleanText.includes("login") ||
      cleanText.includes("log in") ||
      cleanText.includes("sign in") ||
      cleanText.includes("submit") ||
      cleanText.includes("go") ||
      cleanText.includes("yes");

    // Global override: If both email and password exist and user says "login" or similar, log in immediately
    if (currentEmail && currentPassword && isLoginIntent) {
      voiceStepRef.current = "idle";
      setVoiceStep("idle");
      loginUser();
      return;
    }

    if (currentStep === "mode") {
      if (isLoginIntent) {
        if (currentEmail && currentPassword) {
          voiceStepRef.current = "idle";
          setVoiceStep("idle");
          loginUser();
          return;
        } else if (currentEmail && !currentPassword) {
          voiceStepRef.current = "password";
          setVoiceStep("password");
          speakWithFallback("Please state your password.", null, () => {
            startListeningForStep("password");
          });
          return;
        }
        voiceStepRef.current = "email";
        setVoiceStep("email");
        speakWithFallback("Please state your email address.", null, () => {
          startListeningForStep("email");
        });
      } else if (
        cleanText.includes("register") ||
        cleanText.includes("create") ||
        cleanText.includes("signup") ||
        cleanText.includes("sign up")
      ) {
        voiceStepRef.current = "idle";
        setVoiceStep("idle");
        speakWithFallback("Opening registration page.", null, () => {
          navigate("/register", { state: { voiceStart: true } });
        });
      } else {
        speakWithFallback("Would you like to login or register?", null, () => {
          startListeningForStep("mode");
        });
      }
    } else if (currentStep === "email") {
      const parsedEmail = cleanSpokenEmail(text);
      setEmail(parsedEmail);
      emailRef.current = parsedEmail; // Update ref synchronously
      speakWithFallback(
        `Email set to ${parsedEmail.split("").join(" ")}. Next, please state your password.`,
        null,
        () => {
          voiceStepRef.current = "password";
          setVoiceStep("password");
          startListeningForStep("password");
        }
      );
    } else if (currentStep === "password") {
      const parsedPassword = cleanText.replace(/\s+/g, ""); // remove spaces
      if (parsedPassword.length < 8) {
        speakWithFallback(
          "Password must be at least 8 characters. Please state your password again.",
          null,
          () => {
            startListeningForStep("password");
          }
        );
        return;
      }

      setPassword(parsedPassword);
      passwordRef.current = parsedPassword; // Update ref synchronously
      speakWithFallback(
        "Password received. Say login to sign in.",
        null,
        () => {
          voiceStepRef.current = "confirm";
          setVoiceStep("confirm");
          startListeningForStep("confirm");
        }
      );
    } else if (currentStep === "confirm" || currentStep === "idle") {
      if (isLoginIntent) {
        if (currentEmail && currentPassword) {
          voiceStepRef.current = "idle";
          setVoiceStep("idle");
          loginUser();
        } else {
          speakWithFallback("Please enter both email and password before logging in.");
        }
      } else if (
        cleanText.includes("clear") ||
        cleanText.includes("reset") ||
        cleanText.includes("start over") ||
        cleanText.includes("clean") ||
        cleanText.includes("delete")
      ) {
        setEmail("");
        setPassword("");
        emailRef.current = "";
        passwordRef.current = "";
        voiceStepRef.current = "idle";
        setVoiceStep("idle");
        speakWithFallback("Form cleared. Tap the mic button to start over.");
      } else {
        speakWithFallback("Say login to sign in, or clear to reset.");
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
        step === "mode" 
          ? "Say login or register..." 
          : step === "email" 
            ? "Say your email..." 
            : step === "password" 
              ? "Say your password..." 
              : "Say login to sign in..."
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

  const startVoiceLoginWizard = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const currentEmail = (emailRef.current || email).trim();
    const currentPassword = (passwordRef.current || password).trim();

    if (currentEmail && currentPassword) {
      voiceStepRef.current = "confirm";
      setVoiceStep("confirm");
      speakWithFallback("Credentials filled. Say login to sign in.", null, () => {
        startListeningForStep("confirm");
      });
      return;
    }

    if (currentEmail && !currentPassword) {
      voiceStepRef.current = "password";
      setVoiceStep("password");
      speakWithFallback(`Email set. Please state your password.`, null, () => {
        startListeningForStep("password");
      });
      return;
    }

    voiceStepRef.current = "mode";
    setVoiceStep("mode");
    speakWithFallback("Would you like to login or register?", null, () => {
      startListeningForStep("mode");
    });
  };


  return (
    <div className="bg-linear-to-br from-blue-100 to-gray-200 min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">

          {/* USER LOGIN */}
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-900 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <Accessibility size={40} className="text-white" />
                </div>

                <h1 className="text-4xl font-bold text-blue-900 mt-5">
                  AccessRide
                </h1>

                <p className="text-gray-500 mt-2 text-lg">
                  Smart Mobility for Everyone
                </p>
              </div>

              {/* Email */}
              <div className="mb-5">
                <label className="block text-blue-900 font-semibold mb-2">
                  Email Address
                </label>

                <div className="flex items-center border-2 border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-900">
                  <Mail className="text-gray-400" size={20} />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full ml-3 outline-none"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      emailRef.current = e.target.value;
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-blue-900 font-semibold mb-2">
                  Password
                </label>

                <div className="flex items-center border-2 border-gray-300 rounded-2xl px-4 py-3 focus-within:border-blue-900">
                  <Lock className="text-gray-400 shrink-0" size={20} />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full ml-3 outline-none"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      passwordRef.current = e.target.value;
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-blue-900 focus:outline-none ml-2 cursor-pointer shrink-0"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="text-right mb-6">
                <a
                  href="#"
                  className="text-blue-900 font-semibold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                onClick={loginUser}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-4 rounded-2xl text-xl font-bold shadow-lg"
              >
                Login
              </button>

              {userError && <p className="text-red-500 mt-2">{userError}</p>}

              {/* Voice Login */}
              <div className="text-center mt-10">
                <button
                  onClick={startVoiceLoginWizard}
                  className={`w-24 h-24 rounded-full shadow-lg flex items-center justify-center mx-auto transition-all cursor-pointer ${
                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-yellow-400 hover:bg-yellow-300 text-yellow-900"
                  }`}
                >
                  {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                </button>

                <p className="text-blue-900 font-semibold text-xl mt-4">
                  {voiceStatus}
                </p>
              </div>

              <div className="flex items-center my-8">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-4 text-gray-400 text-sm">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <div className="text-center text-gray-500">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="text-blue-900 font-bold hover:underline"
                >
                  Create Account
                </a>
              </div>
              
              <div className="text-center mt-4 border-t pt-3">
                <a
                  href="/"
                  className="text-gray-500 hover:text-gray-700 font-semibold hover:underline text-sm"
                >
                  ← Back to Selector
                </a>
              </div>
            </>

        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="text-blue-900" />
            </div>

            <div>
              <h3 className="font-bold text-gray-700">Secure</h3>
              <p className="text-gray-500 text-sm">Protected Login</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Headphones className="text-blue-900" />
            </div>

            <div>
              <h3 className="font-bold text-gray-700">24/7</h3>
              <p className="text-gray-500 text-sm">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

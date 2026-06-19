import React, { useState } from "react";
import { UserPlus, Mic } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

function Register() {
  const [searchParams] = useSearchParams();
  const defaultDriver = searchParams.get("driver") === "true";
  const [isDriver, setIsDriver] = useState(defaultDriver);
  const backendBase =  "http://localhost/AccessRide/AccessrideBackend/login";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    guardianName: "",
    guardianNumber: "",
    vehicleType: "Sedan",
    plateNumber: "",
    licenseNumber: "",
    insurance: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = async () => {
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
    } = formData;

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      alert("Please fill all required fields");
      return;
    }

    if (!isDriver && (!guardianName || !guardianNumber)) {
      alert("Please fill all required fields including guardian details");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!agree) {
      alert("You must agree to the terms");
      return;
    }

    try {
      const response = await fetch(`${backendBase}/api/register.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, isDriver }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      alert(result.message || `Registration successful for ${firstName} ${lastName}.`);
      window.location.reload();
    } catch (error) {
      alert(error.message);
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
      <main className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-900 rounded-2xl flex items-center justify-center">
                <UserPlus className="text-white" size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-blue-900">
                  Create Your Account
                </h1>
                <p className="text-gray-500 text-sm">
                  Register as a Rider or Driver
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

          {/* Role Toggle */}
          <div className="flex gap-2 mb-6 justify-center">
            <button
              type="button"
              onClick={() => setIsDriver(false)}
              className={`px-4 py-2 rounded-full font-semibold ${
                !isDriver
                  ? "bg-blue-900 text-white"
                  : "bg-white text-blue-900 border border-gray-200"
              }`}
            >
              Register as Rider
            </button>

            <button
              type="button"
              onClick={() => setIsDriver(true)}
              className={`px-4 py-2 rounded-full font-semibold ${
                isDriver
                  ? "bg-blue-900 text-white"
                  : "bg-white text-blue-900 border border-gray-200"
              }`}
            >
              Register as Driver
            </button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            {!isDriver && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-900 font-semibold mb-1">
                    Guardian Name
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
                    Guardian Number
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
            )}

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

            {/* Driver Fields */}
            {isDriver && (
              <div className="space-y-4">
                <div>
                  <label className="block text-blue-900 font-semibold mb-1">
                    Vehicle Type
                  </label>

                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300"
                  >
                    <option>Auto</option>
                    <option>Taxi</option>
                    <option>Wheelchair Accessible</option>
                    <option>Van</option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-900 font-semibold mb-1">
                    License Plate
                  </label>

                  <input
                    type="text"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-blue-900 font-semibold mb-1">
                    Driver License Number
                  </label>

                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-blue-900 font-semibold mb-1">
                    Insurance Document URL
                  </label>

                  <input
                    type="text"
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300"
                  />
                </div>
              </div>
            )}

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

            {!isDriver && (
              <div className="flex flex-col items-center mt-4">
                <button
                  type="button"
                  onClick={voiceReadForm}
                  className="w-24 h-24 bg-yellow-400 hover:bg-yellow-300 rounded-full shadow-lg flex items-center justify-center"
                >
                  <Mic size={40} className="text-yellow-900" />
                </button>

                <span className="text-blue-900 font-semibold text-xl mt-4">
                  Use voice to register
                </span>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

export default Register;
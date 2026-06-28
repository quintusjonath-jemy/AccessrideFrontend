import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadCard from "../login/UploadCard";

const DriverRegister = () => {
    const navigate = useNavigate();

    const handleSubmit = () => {
        alert("Registration submitted successfully! You will be redirected to the login page.");
        navigate("/driver-login");
    };

    const [step, setStep] = useState(1);

    const totalSteps = 10;

    const [formData, setFormData] = useState({

        phone: "",
        otp: "",
        firstName: "",
        lastName: "",
        nic: "",
        dob: "",
        gender: "",

    });

    const [files, setFiles] = useState({

        driverPhoto: null,

    });

    const [preview, setPreview] = useState({

        driverPhoto: null,

    });

    const [otpSent, setOtpSent] = useState(false);

    const [otpVerified, setOtpVerified] = useState(false);

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };

    const handleFileChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setFiles({
            ...files,
            [e.target.name]: file,
        });

        setPreview({
            ...preview,
            [e.target.name]: URL.createObjectURL(file),
        });

    };

    const sendOTP = () => {

        if (!formData.phone) {

            alert("Please enter phone number");

            return;
        }

        alert("Demo OTP Sent : 1234");

        setOtpSent(true);

    };

    const verifyOTP = () => {

        if (formData.otp === "1234") {

            setOtpVerified(true);

            alert("Phone Number Verified");

            setStep(2);

        } else {

            alert("Invalid OTP");

        }

    };

    const validateStep2 = () => {

        const newErrors = {};

        if (!formData.firstName)
            newErrors.firstName = "First name required";

        if (!formData.lastName)
            newErrors.lastName = "Last name required";

        if (!formData.nic)
            newErrors.nic = "NIC required";

        if (!formData.dob)
            newErrors.dob = "Date of birth required";

        if (!formData.gender)
            newErrors.gender = "Gender required";

        if (!files.driverPhoto)
            newErrors.driverPhoto = "Driver photo required";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    };

    const nextStep = () => {

        if (step === 2) {

            if (!validateStep2()) return;

        }

        setStep(step + 1);

    };


    const prevStep = () => {

        if (step > 1) {

            setStep(step - 1);

        }

    };

    const ProgressBar = () => (

        <div className="mb-8">

            <div className="flex justify-between mb-2">

                <span className="font-semibold">
                    Step {step} of {totalSteps}
                </span>

                <span>
                    {Math.round((step / totalSteps) * 100)}%
                </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">

                <div
                    className="bg-blue-900 h-3 rounded-full transition-all duration-300"
                    style={{
                        width: `${(step / totalSteps) * 100}%`,
                    }}
                />

            </div>

        </div>

    );

    const renderPhoneVerification = () => (

        <div>

            <h2 className="text-2xl font-bold mb-2">
                Phone Verification
            </h2>

            <p className="text-gray-600 mb-6">
                Enter your mobile number to receive a verification code.
            </p>

            <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+94 77 1234567"
                className="w-full border p-3 rounded-lg mb-4"
            />

            {!otpSent && (

                <button
                    type="button"
                    onClick={sendOTP}
                    className="bg-blue-900 text-white px-6 py-3 rounded-lg"
                >
                    Send OTP
                </button>

            )}

            {otpSent && (

                <div className="mt-6">

                    <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="Enter 4 Digit OTP"
                        className="w-full border p-3 rounded-lg mb-4"
                    />

                    <button
                        type="button"
                        onClick={verifyOTP}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg"
                    >
                        Verify OTP
                    </button>

                </div>

            )}

        </div>

    );

    const renderPersonalInfo = () => (

        <div>

            <h2 className="text-2xl font-bold mb-2">
                Personal Information
            </h2>

            <p className="text-gray-600 mb-6">
                Please enter your personal details exactly as shown on your
                National Identity Card.
            </p>

            <div className="grid md:grid-cols-2 gap-4">

                <div>

                    <label className="block mb-1 font-medium">
                        First Name
                    </label>

                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    />

                    {errors.firstName && (
                        <p className="text-red-500 text-sm">
                            {errors.firstName}
                        </p>
                    )}

                </div>

                <div>

                    <label className="block mb-1 font-medium">
                        Last Name
                    </label>

                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    />

                    {errors.lastName && (
                        <p className="text-red-500 text-sm">
                            {errors.lastName}
                        </p>
                    )}

                </div>

                <div>

                    <label className="block mb-1 font-medium">
                        NIC Number
                    </label>

                    <input
                        type="text"
                        name="nic"
                        value={formData.nic}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    />

                    {errors.nic && (
                        <p className="text-red-500 text-sm">
                            {errors.nic}
                        </p>
                    )}

                </div>

                <div>

                    <label className="block mb-1 font-medium">
                        Date of Birth
                    </label>

                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    />

                </div>

                <div>

                    <label className="block mb-1 font-medium">
                        Gender
                    </label>

                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    >
                        <option value="">Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                    </select>

                </div>

            </div>

            <div className="mt-8">

                <UploadCard
                    title="Driver Photo"
                    name="driverPhoto"
                    preview={preview.driverPhoto}
                    onChange={handleFileChange}
                    instructions="Upload a clear color photo of yourself. Face must be clearly visible without sunglasses or face masks. Good lighting is essential. Accepted formats: JPG, PNG, JPEG. Max size: 5MB. "
                />

            </div>

            <div className="flex justify-between mt-8">

                <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border rounded-lg"
                >
                    Back
                </button>

                <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg"
                >
                    Next
                </button>

            </div>

        </div>

    );
    const renderAddressInfo = () => (

        <div>

            <h2 className="text-2xl font-bold mb-2">
                Address Information
            </h2>

            <p className="text-gray-600 mb-6">
                Enter your current residential address.
            </p>

            <div className="grid md:grid-cols-2 gap-4">

                <div>
                    <label>Street Address</label>
                    <input
                        type="text"
                        name="street"
                        value={formData.street || ""}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

                <div>
                    <label>Town / City</label>
                    <input
                        type="text"
                        name="town"
                        value={formData.town || ""}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

                <div>
                    <label>District</label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district || ""}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

                <div>
                    <label>Province</label>
                    <select
                        name="province"
                        value={formData.province || ""}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    >
                        <option value="">Select Province</option>
                        <option>Northern</option>
                        <option>Eastern</option>
                        <option>Western</option>
                        <option>Southern</option>
                        <option>Central</option>
                        <option>North Central</option>
                        <option>North Western</option>
                        <option>Uva</option>
                        <option>Sabaragamuwa</option>
                    </select>
                </div>

                <div>
                    <label>Postal Code</label>
                    <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode || ""}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

            </div>

            <div className="flex justify-between mt-8">
                <button type="button" onClick={prevStep}
                    className="px-6 py-3 border rounded-lg">
                    Back
                </button>

                <button type="button" onClick={nextStep}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg">
                    Next
                </button>
            </div>

        </div>

    );

    const renderVehicleInfo = () => (

        <div>

            <h2 className="text-2xl font-bold mb-2">
                Vehicle Information
            </h2>

            <p className="text-gray-600 mb-6">
                Please enter your vehicle details carefully. These details will be verified by our team.
            </p>

            <div className="space-y-5">

                <div>
                    <label className="block mb-2 font-medium">
                        Vehicle Type
                    </label>

                    <select
                        name="vehicleType"
                        value={formData.vehicleType || ""}
                        onChange={handleChange}
                        className="w-full border p-3 rounded-lg"
                    >
                        <option value="">Select Vehicle Type</option>
                        <option>Car</option>
                        <option>Van</option>
                        <option>Wheelchair Accessible Vehicle</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Vehicle Brand
                    </label>

                    <input
                        type="text"
                        name="vehicleBrand"
                        value={formData.vehicleBrand || ""}
                        onChange={handleChange}
                        placeholder="Toyota"
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Vehicle Model
                    </label>

                    <input
                        type="text"
                        name="vehicleModel"
                        value={formData.vehicleModel || ""}
                        onChange={handleChange}
                        placeholder="Prius"
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Vehicle Color
                    </label>

                    <input
                        type="text"
                        name="vehicleColor"
                        value={formData.vehicleColor || ""}
                        onChange={handleChange}
                        placeholder="White"
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Year of Manufacture
                    </label>

                    <input
                        type="number"
                        name="yearManufacture"
                        value={formData.yearManufacture || ""}
                        onChange={handleChange}
                        placeholder="2020"
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium">
                        Vehicle Registration Number
                    </label>

                    <input
                        type="text"
                        name="vehicleRegistrationNumber"
                        value={formData.vehicleRegistrationNumber || ""}
                        onChange={handleChange}
                        placeholder="CAA-1234"
                        className="w-full border p-3 rounded-lg"
                    />
                </div>

            </div>

            <div className="flex justify-between mt-8">

                <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border rounded-lg"
                >
                    Back
                </button>

                <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg"
                >
                    Next
                </button>

            </div>

        </div>

    );
    const renderLicenseInfo = () => (

        <div>

            <h2 className="text-2xl font-bold mb-6">
                Driving License Information
            </h2>

            <input
                type="text"
                name="licenseNumber"
                placeholder="License Number"
                onChange={handleChange}
                className="w-full border p-3 rounded-lg mb-4"
            />

            <input
                type="date"
                name="licenseExpiry"
                onChange={handleChange}
                className="w-full border p-3 rounded-lg mb-6"
            />

            <div className="grid md:grid-cols-2 gap-6">

                <UploadCard
                    title="License Front"
                    name="licenseFront"
                    preview={preview.licenseFront}
                    onChange={handleFileChange}
                    instructions="Upload the front side of your driving license."
                />

                <UploadCard
                    title="License Back"
                    name="licenseBack"
                    preview={preview.licenseBack}
                    onChange={handleFileChange}
                    instructions="Upload the back side of your driving license."
                />

            </div>

            <div className="flex justify-between mt-8">
                <button onClick={prevStep}
                    className="px-6 py-3 border rounded-lg">
                    Back
                </button>

                <button onClick={nextStep}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg">
                    Next
                </button>
            </div>

        </div>

    );
    const renderVehicleDocuments = () => (

        <div>

            <h2 className="text-2xl font-bold mb-6">
                Vehicle Documents
            </h2>

            <UploadCard
                title="Vehicle Registration Certificate"
                name="registrationImage"
                preview={preview.registrationImage}
                onChange={handleFileChange}
                instructions="Upload a clear image of the front side of your vehicle registration certificate.
               All text must be visible. "
            />

            <label className="mt-4 block">
                Registration Expiry Date
            </label>

            <input
                type="date"
                name="registrationExpiry"
                onChange={handleChange}
                className="w-full border p-3 rounded-lg mb-6"
            />

            <UploadCard
                title="Insurance Certificate"
                name="insuranceImage"
                preview={preview.insuranceImage}
                onChange={handleFileChange}
                instructions="Upload a clear image of your insurance certificate.
               All text must be visible. "
            />

            <label className="mt-4 block">
                Insurance Expiry Date
            </label>

            <input
                type="date"
                name="insuranceExpiry"
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
            />

            <div className="flex justify-between mt-8">
                <button onClick={prevStep}
                    className="px-6 py-3 border rounded-lg">
                    Back
                </button>

                <button onClick={nextStep}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg">
                    Next
                </button>
            </div>

        </div>

    );

    const renderNICVerification = () => (

        <div>

            <h2 className="text-2xl font-bold mb-6">
                NIC Verification
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

                <UploadCard
                    title="NIC Front Image"
                    name="nicFront"
                    preview={preview.nicFront}
                    onChange={handleFileChange}
                    instructions="Upload a clear image of the front side of your NIC."
                />

                <UploadCard
                    title="NIC Back Image"
                    name="nicBack"
                    preview={preview.nicBack}
                    onChange={handleFileChange}
                    instructions="Upload a clear image of the back side of your NIC."
                />
            </div>

            <div className="flex justify-between mt-8">

                <button onClick={prevStep}
                    className="px-6 py-3 border rounded-lg">
                    Back
                </button>

                <button onClick={nextStep}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg">
                    Next
                </button>

            </div>

        </div>

    );

    const renderVehiclePhotos = () => (

        <div>

            <h2 className="text-2xl font-bold mb-6">
                Vehicle Photos
            </h2>

            <p className="bg-blue-50 p-4 rounded-lg mb-6">

                Upload clear photos showing the complete vehicle.

            </p>

            <div className="grid md:grid-cols-2 gap-6">

                <UploadCard
                    title="Vehicle Front"
                    name="vehicleFront"
                    preview={preview.vehicleFront}
                    onChange={handleFileChange}
                    instructions="Take a clear photo of the front side of your vehicle."
                />

                <UploadCard
                    title="Vehicle Rear"
                    name="vehicleRear"
                    preview={preview.vehicleRear}
                    onChange={handleFileChange}
                    instructions="Take a clear photo of the rear side of your vehicle."
                />

                <UploadCard
                    title="Vehicle Interior"
                    name="vehicleInterior"
                    preview={preview.vehicleInterior}
                    onChange={handleFileChange}
                    instructions="Show passenger seating area clearly."
                />

                <UploadCard
                    title="Dashboard Photo"
                    name="dashboardPhoto"
                    preview={preview.dashboardPhoto}
                    onChange={handleFileChange}
                    instructions="Show steering wheel and dashboard."
                />

            </div>

            <div className="flex justify-between mt-8">

                <button onClick={prevStep}
                    className="px-6 py-3 border rounded-lg">
                    Back
                </button>

                <button onClick={nextStep}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg">
                    Next
                </button>

            </div>

        </div>

    );
    const renderPasswordSetup = () => (

        <div>

            <h2 className="text-2xl font-bold mb-6">
                Create Password
            </h2>

            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full border p-3 rounded-lg mb-4"
            />

            <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
            />

            <div className="flex justify-between mt-8">

                <button onClick={prevStep}
                    className="px-6 py-3 border rounded-lg">
                    Back
                </button>

                <button onClick={nextStep}
                    className="px-6 py-3 bg-blue-900 text-white rounded-lg">
                    Next
                </button>

            </div>

        </div>

    );
    const renderReviewSubmit = () => (

        <div>

            <h2 className="text-2xl font-bold mb-6">
                Review Information
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg">

                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>

                <p><strong>NIC:</strong> {formData.nic}</p>

                <p><strong>Phone:</strong> {formData.phone}</p>

                <p><strong>Email:</strong> {formData.email}</p>

                <p><strong>Vehicle:</strong> {formData.vehicleBrand} {formData.vehicleModel}</p>

                <p><strong>Registration:</strong> {formData.vehicleRegistrationNumber}</p>

            </div>

            <div className="flex justify-between mt-8">

                <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border rounded-lg"
                >
                    Back
                </button>

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg"
                >
                    Submit Registration
                </button>

            </div>

        </div>

    );


    return (

        <div className="min-h-screen bg-gray-100 py-10">

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-900">
                        Driver Registration
                    </h1>
                    <a
                        href="/driver-login"
                        className="text-blue-600 hover:underline"
                    >
                        Back to Sign In
                    </a>
                </div>


                <ProgressBar />

                {step === 1 && renderPhoneVerification()}

                {step === 2 && renderPersonalInfo()}

                {step === 3 && renderAddressInfo()}
                {step === 4 && renderVehicleInfo()}
                {step === 5 && renderLicenseInfo()}
                {step === 6 && renderVehicleDocuments()}
                {step === 7 && renderNICVerification()}
                {step === 8 && renderVehiclePhotos()}
                {step === 9 && renderPasswordSetup()}
                {step === 10 && renderReviewSubmit()}
            </div>

        </div>

    );

};


export default DriverRegister;
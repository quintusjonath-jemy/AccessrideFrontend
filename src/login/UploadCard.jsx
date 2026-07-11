import React, { useState, useRef } from "react";

const UploadCard = ({ title, name, preview, onChange, instructions, fit = "cover", error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onChange({ target: { name: name, files: [file] } });
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">{title}</h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm">{instructions}</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          id={name}
          name={name}
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />

        {/* DROP AREA */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 flex items-center justify-center cursor-pointer transition
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"}
          ${preview ? "p-0 overflow-hidden" : ""}
        `}
          style={{ height: "220px" }}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt={title}
                className={`w-full h-full ${fit === "contain"
                    ? "object-contain bg-gray-100"
                    : "object-cover"
                  }`}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-3">

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(true);
                  }}
                  className="bg-white text-black px-4 py-2 rounded-lg"
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Change
                </button>

              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📁</div>
              <p className="font-medium">Drag & Drop or Click to Upload</p>
              <p className="text-sm text-gray-500">JPG, PNG, JPEG</p>
            </div>
          )}
        </div>
      </div>
      {error && (
          <p className="text-red-500 text-sm mt-2">
            {error}
          </p>
        )}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={preview}
            alt="Preview"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
          />
        </div>
      )}
    </>
  );
};

export default UploadCard;
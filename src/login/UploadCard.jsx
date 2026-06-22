import React, { useState, useRef } from "react";

const UploadCard = ({ title, name, preview, onChange, instructions }) => {
  const [isDragging, setIsDragging] = useState(false);
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
      onChange({ target: { files: [file] } });
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
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
        style={{ minHeight: "180px" }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white font-medium opacity-0 hover:opacity-100 transition">
              Change Image
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
  );
};

export default UploadCard;
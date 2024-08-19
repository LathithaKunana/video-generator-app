import React from 'react';

const ImageSelector = ({ setImages }) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-gray-700 mb-2">Select Images:</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="block w-full text-gray-500"
      />
    </div>
  );
};

export default ImageSelector;

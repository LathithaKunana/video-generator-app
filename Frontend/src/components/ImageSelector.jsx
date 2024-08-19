import React from 'react';
import { FaImage } from 'react-icons/fa';

const ImageSelector = ({ setImages }) => {
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center">
      <FaImage className="text-gray-500 mr-2" />
      <div className="flex-grow">
        <label className="block text-gray-700 mb-2">Select Images:</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-gray-500"
        />
      </div>
    </div>
  );
};

export default ImageSelector;

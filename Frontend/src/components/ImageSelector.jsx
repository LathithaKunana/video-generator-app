import React from 'react';
import axios from 'axios';

const ImageSelector = ({ setImages }) => {
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'rc98zxhy'); // Add your Cloudinary upload preset

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dxhxijoo4/image/upload`,
          formData
        );
        return response.data.secure_url;
      })
    );

    setImages(uploadedImages);
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

import React, { useState } from 'react';
import axios from 'axios';

const ImageSelector = ({ setImages }) => {
  const [uploading, setUploading] = useState(false); // Add loading state

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const uploadedImages = [];
    const failedUploads = [];
  
    try {
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'rc98zxhy');
  
          try {
            const response = await axios.post(
              `https://api.cloudinary.com/v1_1/dxhxijoo4/image/upload`,
              formData
            );
            uploadedImages.push(response.data.secure_url);
          } catch (uploadError) {
            failedUploads.push(file.name);
          }
        })
      );
  
      if (failedUploads.length > 0) {
        alert(`Failed to upload the following images: ${failedUploads.join(', ')}`);
      }
  
      setImages(uploadedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
    }
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
        disabled={uploading} // Disable input during upload
      />
      {uploading && (
        <div className="mt-2 text-blue-500">Uploading images...</div>
      )}
    </div>
  );
};

export default ImageSelector;

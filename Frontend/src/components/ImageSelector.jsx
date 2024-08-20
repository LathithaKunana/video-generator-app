import React, { useState } from 'react';
import axios from 'axios';

const ImageSelector = ({ setImages }) => {
  const [uploading, setUploading] = useState(false);

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      alert("You can upload a maximum of 6 files (images/videos/GIFs) at a time.");
      return;
    }
    setUploading(true);
    const uploadedMedia = [];
    const failedUploads = [];

    try {
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'rc98zxhy');

          const uploadUrl = file.type.startsWith('image/')
            ? `https://api.cloudinary.com/v1_1/dxhxijoo4/image/upload`
            : `https://api.cloudinary.com/v1_1/dxhxijoo4/video/upload`; // Use video endpoint for videos and GIFs

          try {
            const response = await axios.post(uploadUrl, formData);
            uploadedMedia.push(response.data.secure_url);
          } catch (uploadError) {
            failedUploads.push(file.name);
          }
        })
      );

      if (failedUploads.length > 0) {
        alert(`Failed to upload the following files: ${failedUploads.join(', ')}`);
      }

      setImages(uploadedMedia);
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload some media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-gray-700 mb-2">Select Images/Videos/GIFs:</label>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleMediaUpload}
        className="block w-full text-gray-500"
        disabled={uploading}
      />
      {uploading && (
        <div className="mt-2 text-blue-500">Uploading media...</div>
      )}
    </div>
  );
};

export default ImageSelector;

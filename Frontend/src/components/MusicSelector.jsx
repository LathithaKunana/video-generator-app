import React, { useState } from 'react';
import axios from 'axios';

const MusicSelector = ({ setMusic }) => {
  const [uploading, setUploading] = useState(false); // Add loading state

  const handleMusicUpload = async (e) => {
    const file = e.target.files[0];
    setUploading(true); // Start loading

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'rc98zxhy'); // Add your Cloudinary upload preset

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dxhxijoo4/video/upload`, // Use video endpoint for audio
        formData
      );

      setMusic(response.data.secure_url);
    } catch (error) {
      console.error('Error uploading music:', error);
      alert('Failed to upload music. Please try again.');
    } finally {
      setUploading(false); // Stop loading
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-gray-700 mb-2">Select Background Music:</label>
      <input
        type="file"
        accept="audio/*"
        onChange={handleMusicUpload}
        className="block w-full text-gray-500"
        disabled={uploading} // Disable input during upload
      />
      {uploading && (
        <div className="mt-2 text-blue-500">Uploading music...</div>
      )}
    </div>
  );
};

export default MusicSelector;

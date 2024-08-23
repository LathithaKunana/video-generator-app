import React, { useState } from 'react';
import axios from 'axios';

const MusicSelector = ({ setMusic }) => {
  const [uploading, setUploading] = useState(false); // State to manage uploading status

  // Handles music upload when a file is selected
  const handleMusicUpload = async (e) => {
    const file = e.target.files[0]; // Get the selected file
    setUploading(true); // Set uploading state to true

    try {
      const formData = new FormData(); // Create a FormData object
      formData.append('file', file);
      formData.append('upload_preset', 'rc98zxhy'); // Use your Cloudinary upload preset

      // Upload the music file to Cloudinary using the video endpoint (suitable for audio files)
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dxhxijoo4/video/upload`, // Cloudinary video endpoint for audio files
        formData
      );

      // Update the parent component's state with the uploaded music URL
      setMusic(response.data.secure_url);
    } catch (error) {
      console.error('Error uploading music:', error);
      alert('Failed to upload music. Please try again.'); // Alert if there is an error
    } finally {
      setUploading(false); // Set uploading state to false when done
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* Input label */}
      <label className="block text-gray-700 mb-2">Select Background Music:</label>
      
      {/* File input field */}
      <input
        type="file"
        accept="audio/*"
        onChange={handleMusicUpload}
        className="block w-full text-gray-500"
        disabled={uploading} // Disable input while uploading
      />
      
      {/* Show uploading status */}
      {uploading && (
        <div className="mt-2 text-blue-500">Uploading music...</div>
      )}
    </div>
  );
};

export default MusicSelector;

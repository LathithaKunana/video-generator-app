import React from 'react';
import axios from 'axios';

const MusicSelector = ({ setMusic }) => {
  const handleMusicUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rwba17nn'); // Add your Cloudinary upload preset

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dnryho2ce/video/upload`, // Use video endpoint for audio
      formData
    );

    setMusic(response.data.secure_url);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-gray-700 mb-2">Select Background Music:</label>
      <input
        type="file"
        accept="audio/*"
        onChange={handleMusicUpload}
        className="block w-full text-gray-500"
      />
    </div>
  );
};

export default MusicSelector;

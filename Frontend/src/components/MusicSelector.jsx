import React from 'react';
import { FaMusic } from 'react-icons/fa';

const MusicSelector = ({ setMusic }) => {
  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    setMusic(file);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center">
      <FaMusic className="text-gray-500 mr-2" />
      <div className="flex-grow">
        <label className="block text-gray-700 mb-2">Select Background Music:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleMusicUpload}
          className="block w-full text-gray-500"
        />
      </div>
    </div>
  );
};

export default MusicSelector;

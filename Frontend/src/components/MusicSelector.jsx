import React from 'react';

const MusicSelector = ({ setMusic }) => {
  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    setMusic(file);
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

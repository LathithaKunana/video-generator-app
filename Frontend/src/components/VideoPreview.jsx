import React from 'react';

const VideoPreview = ({ videoUrl }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <video src={videoUrl} controls className="w-full rounded-lg" />
    </div>
  );
};

export default VideoPreview;

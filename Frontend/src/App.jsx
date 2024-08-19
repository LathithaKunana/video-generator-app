import React, { useState } from 'react';
import ImageSelector from './components/ImageSelector';
import MusicSelector from './components/MusicSelector';
import VideoPreview from './components/VideoPreview';
import axios from 'axios';

function App() {
  const [images, setImages] = useState([]);
  const [music, setMusic] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      
      // Append each selected image file to the FormData
      images.forEach((image) => {
        formData.append('images', image);
      });
  
      // Append the selected music file to the FormData
      formData.append('music', music);
  
      // Send the FormData to the backend
      const response = await axios.post('http://localhost:5000/api/video/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setVideoUrl(response.data.videoUrl);
    } catch (error) {
      console.error('Error generating video:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {!videoUrl && (
        <div className="space-y-6">
          <ImageSelector setImages={setImages} />
          {images.length > 0 && <MusicSelector setMusic={setMusic} />}
          {images.length > 0 && music && (
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Generate Video
            </button>
          )}
        </div>
      )}
      {videoUrl && <VideoPreview videoUrl={videoUrl} />}
    </div>
  );
}

export default App;

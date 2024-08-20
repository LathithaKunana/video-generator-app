import React, { useState } from 'react';
import { FaVideo } from 'react-icons/fa';
import ImageSelector from './components/ImageSelector';
import MusicSelector from './components/MusicSelector';
import VideoPreview from './components/VideoPreview';
import axios from 'axios';
import Notice from './components/Notice';

function App() {
  const [images, setImages] = useState([]);
  const [music, setMusic] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const pollVideoStatus = async (id) => {
    try {
      let statusResponse;
      let attempts = 0;
  
      do {
        console.log(`Polling attempt ${attempts + 1} for video ID: ${id}`);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Poll every 10 seconds
  
        statusResponse = await axios.get(`http://localhost:5000/api/video/status/${id}`);
        console.log(`Status response for attempt ${attempts + 1}:`, statusResponse.data);
  
        // Check if the response includes the video URL
        if (statusResponse.data.url) {
          setVideoUrl(statusResponse.data.url);
          return;
        }
  
        attempts += 1;
      } while (attempts < 30);
  
      console.error('Video generation did not complete successfully.');
    } catch (error) {
      console.error('Error polling video status:', error.response?.data || error.message || error);
      setLoading(false);
    }
  };
  
  

  const handleSubmit = async () => {
    setLoading(true);

    try {
        // Send the images and music to the backend to generate the video
        const generateResponse = await axios.post('http://localhost:5000/api/video/generate', {
          media: images,  // Rename images to media
          music,
      });

        const videoId = generateResponse.data.videoId;
        if (!videoId) throw new Error('Failed to retrieve videoId');

        // Poll the server to check the status of the video generation
        await pollVideoStatus(videoId);
    } catch (error) {
        console.error('Error submitting video generation:', error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <Notice/>
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <ImageSelector setImages={setImages} />
          {images.length > 0 && <MusicSelector setMusic={setMusic} />}
          {images.length > 0 && music && (
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full mt-4"
              disabled={loading} // Disable button during loading
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center">
                  <FaVideo className="mr-2" /> Generate Video
                </div>
              )}
            </button>
          )}
        </div>

        {videoUrl && (
          <div className="mt-6">
            <VideoPreview videoUrl={videoUrl} />
            <button
              onClick={() => setVideoUrl(null)}
              className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 w-full mt-4"
            >
              Generate Another Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

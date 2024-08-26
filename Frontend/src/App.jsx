// App.jsx
import React, { useState } from 'react';
import { FaVideo } from 'react-icons/fa';
import Sidebar from './components/Sidebar';
import VideoPreview from './components/VideoPreview';
import axios from 'axios';
import Notice from './components/Notice';

function App() {
  const [folders, setFolders] = useState({
    images: [],
    videos: [],
    gifs: [],
    screenshots: [],
    reviews: [],
    music: [],
  });
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to poll the server to check the video status
  const pollVideoStatus = async (id) => {
    try {
      let statusResponse;
      let attempts = 0;

      // Poll every 10 seconds, up to 30 attempts
      do {
        console.log(`Polling attempt ${attempts + 1} for video ID: ${id}`);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds

        statusResponse = await axios.get(
          `https://random-proj.vercel.app/api/video/status/${id}`
        );
        console.log(
          `Status response for attempt ${attempts + 1}:`,
          statusResponse.data
        );

        // Check if the video URL is returned
        if (statusResponse.data.url) {
          setVideoUrl(statusResponse.data.url);
          return;
        }

        attempts += 1;
      } while (attempts < 30);

      console.error('Video generation did not complete successfully.');
    } catch (error) {
      console.error(
        'Error polling video status:',
        error.response?.data || error.message || error
      );
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Randomly select one media from each folder and one music file
      const media = Object.keys(folders).reduce((acc, key) => {
        if (key !== 'music' && folders[key].length > 0) {
          const randomIndex = Math.floor(Math.random() * folders[key].length);
          acc.push(folders[key][randomIndex]);
        }
        return acc;
      }, []);
      const musicFolder = folders['music'];
      const music =
        musicFolder.length > 0
          ? musicFolder[Math.floor(Math.random() * musicFolder.length)]
          : null;

      if (media.length === 0 || !music) {
        alert('Please add at least one file to each folder and one music file.');
        setLoading(false);
        return;
      }

      const generateResponse = await axios.post(
        'https://random-proj.vercel.app/api/video/generate',
        { media, music }
      );

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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar folders={folders} setFolders={setFolders} />
      
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col items-center">
        <Notice />
        <div className="w-full max-w-3xl space-y-6">
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div className='flex justify-center'>
               <h1 className='text-xl font-semibold'>
                  Video generating tool
                </h1>
            </div>
           
            {Object.values(folders).some((folder) => folder.length > 0) && (
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 w-full mt-4"
                disabled={loading}
              >
                {loading ? (
                  'Generating...'
                ) : (
                  <>
                    <FaVideo className="mr-2" /> Generate Video
                  </>
                )}
              </button>
            )}
          </div>
          {videoUrl && <VideoPreview videoUrl={videoUrl} />}
        </div>
      </div>
    </div>
  );
}

export default App;

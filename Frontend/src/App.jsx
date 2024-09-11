import React, { useState, useEffect } from 'react';
import { FaVideo } from 'react-icons/fa';
import Sidebar from './components/Sidebar';
import VideoPreview from './components/VideoPreview';
import axios from 'axios';
import Notice from './components/Notice';
import NewSidebar from './components/NewSidebar';  // Import NewSidebar component
import FinalSidebar from './components/FinalSidebar';  // Import FinalSidebar component
import Timer from './components/Timer';  // Import Timer component
import CloudinaryVideoEffects from './components/CloudinaryVideoEffect';


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
  const [showSidebarSection, setShowSidebarSection] = useState(false); // To show new sidebar section
  const [finalSidebarImages, setFinalSidebarImages] = useState({}); // State to manage the final selected images for the right sidebar
  const [initialThumbnails, setInitialThumbnails] = useState({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [timer, setTimer] = useState(null); // To manage the countdown timer
  const [timerVisible, setTimerVisible] = useState(false); // To manage timer visibility
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState(null);
  const [showEffects, setShowEffects] = useState(false);
  const [uploadError, setUploadError] = useState(null);

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
          return statusResponse.data.url;  // Return the URL for further use
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

  const uploadToCloudinary = async (videoBlob) => {
    const formData = new FormData();
    formData.append('file', videoBlob);
    formData.append('upload_preset', 'rwba17nn'); // Replace with your Cloudinary upload preset
  
    try {
      console.log('Uploading to Cloudinary...');
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dnryho2ce/video/upload`,
        formData
      );
      console.log('Cloudinary upload response:', response.data);
      setCloudinaryPublicId(response.data.public_id);
      console.log('Set cloudinaryPublicId to:', response.data.public_id);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      setUploadError('Failed to upload video to Cloudinary. Please try again.');
    }
  };


  const handleSubmit = async () => {
    setLoading(true);
  
    try {
      // Randomly select media and music
      const media = Object.keys(folders).reduce((acc, key) => {
        if (key !== 'music' && folders[key].length > 0) {
          const randomIndex = Math.floor(Math.random() * folders[key].length);
          acc.push(folders[key][randomIndex]);
        }
        return acc;
      }, []);
      
      const musicFolder = folders['music'];
      const music = musicFolder.length > 0
        ? musicFolder[Math.floor(Math.random() * musicFolder.length)]
        : null;
  
      if (media.length === 0 || !music) {
        alert('Please add at least one file to each folder and one music file.');
        setLoading(false);
        return;
      }
  
      // Generate video
      const generateResponse = await axios.post(
        'http://localhost:5000/api/video/generate',
        { media, music }
      );
  
      const videoId = generateResponse.data.videoId;
      if (!videoId) throw new Error('Failed to retrieve videoId');
  
      // Poll for the video URL
      const videoUrl = await pollVideoStatus(videoId);
  
      if (videoUrl) {
        console.log('Video URL received:', videoUrl);
  
        // Upload the video to Cloudinary
        const response = await fetch(videoUrl);
        const videoBlob = await response.blob();
        await uploadToCloudinary(videoBlob);  // This sets the cloudinaryPublicId
      } else {
        console.error('No video URL received after generation');
      }
  
    } catch (error) {
      console.error('Error submitting video generation:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  // Function to show the new sidebar section
  const handleGenerateSidebar = () => {
    setShowSidebarSection(true);
  };

  // Function to randomly select images from the NewSidebar folders and update FinalSidebar
  const handleRandomSelection = () => {
    const updatedFolders = { ...folders };

    Object.keys(updatedFolders).forEach(folderName => {
      const folder = updatedFolders[folderName];
      
      if (folder && folder.images && folder.images.length > 0) {
        const randomIndex = Math.floor(Math.random() * folder.images.length);
        folder.selectedImage = folder.images[randomIndex];
      }
    });

    setFolders(updatedFolders);

    const selectedImages = {};
    Object.keys(updatedFolders).forEach(folderName => {
      const folder = updatedFolders[folderName];
      if (folder.selectedImage) {
        selectedImages[folderName] = folder.selectedImage;
      }
    });

    setFinalSidebarImages(selectedImages);

    // Start the timer and update FinalSidebar every hour
    setTimerVisible(true);
    if (timer) {
      clearInterval(timer); // Clear existing interval if any
    }
    const newTimer = setInterval(() => {
      handleRandomSelection(); // Update images every hour
    }, 3600000); // 3600000 ms = 1 hour
    setTimer(newTimer);
  };

  useEffect(() => {
    console.log('Current cloudinaryPublicId:', cloudinaryPublicId);
  }, [cloudinaryPublicId]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar folders={folders} setFolders={setFolders} />
      
      {/* Main Content */}
      <div className="flex-1 p-4 mr-16 flex flex-col items-center">
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
          {videoUrl && (
            <>
              <VideoPreview videoUrl={videoUrl} />

              {/* Show the effects button after the Cloudinary publicId is set */}
              {cloudinaryPublicId ? (
                <>
                  <CloudinaryVideoEffects 
                    publicId={cloudinaryPublicId} 
                    uploadToCloudinary={uploadToCloudinary}
                  />
                  <button
                    onClick={handleGenerateSidebar}
                    className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full mt-4"
                  >
                Generate Sidebar
              </button>
                </>
              ) : (
                <p>Uploading video to apply effects...</p>
              )}
            </>
          )}

        </div>
        
        {/* New Sidebar Section that appears after clicking "Generate Sidebar" */}
        {showSidebarSection && (
          <div className="new-sidebar-section flex mt-8">
            {/* App.jsx */}
            <NewSidebar 
              folders={folders} 
              setFolders={setFolders} 
              initialThumbnails={initialThumbnails}
              setInitialThumbnails={setInitialThumbnails}
              setIsFinalized={setIsFinalized}
              setFinalSidebarImages={setFinalSidebarImages}  // Pass the function here
            />

            <div className="middle-section flex flex-col justify-center items-center mx-4">
              <button
                onClick={handleRandomSelection}
                className="random-select-btn bg-yellow-500 text-white p-2 rounded-lg"
              >
                Select Random Images
              </button>
            </div>
            {isFinalized && <FinalSidebar finalSidebarImages={finalSidebarImages} />}
            {timerVisible && <Timer duration={900000} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

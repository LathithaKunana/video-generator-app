import React, { useState, useEffect } from 'react';
import { FaVideo } from 'react-icons/fa';
import Sidebar from './components/Sidebar';
import VideoPreview from './components/VideoPreview';
import axios from 'axios';
import Notice from './components/Notice';
import NewSidebar from './components/NewSidebar';  
import FinalSidebar from './components/FinalSidebar';  
import Timer from './components/Timer';  
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
  const [showSidebarSection, setShowSidebarSection] = useState(false);
  const [finalSidebarImages, setFinalSidebarImages] = useState({});
  const [initialThumbnails, setInitialThumbnails] = useState({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [timer, setTimer] = useState(null);
  const [timerVisible, setTimerVisible] = useState(false);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState(null);
  const [showEffects, setShowEffects] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [isTextToSpeech, setIsTextToSpeech] = useState(false);  // Manage TTS state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [team, setTeam] = useState('');
  const [job, setJob] = useState('');
  const [interests, setInterests] = useState('');
  const [audioUrl, setAudioUrl] = useState('');  // Store generated TTS audio
  const [ttsLoading, setTtsLoading] = useState(false);
  const [foldersUpdateCount, setFoldersUpdateCount] = useState(0);

  // Function to submit TTS data to your backend API
  const submitToTextToSpeechAPI = async (sentence, onAudioUrlReceived) => {
    try {
      const response = await axios.post('https://random-proj.vercel.app/api/texttospeech', {
        sentence,  // Send the constructed sentence in the request body
      });
  
      if (response.data.audioUrl) {
        console.log("Audio URL received from API:", response.data.audioUrl);
        onAudioUrlReceived(response.data.audioUrl);  // Call the callback with the audio URL
      } else {
        console.error("Failed to generate audio. No URL returned.");
      }
    } catch (error) {
      console.error("Error submitting text to speech API:", error);
    }
  };
  
  const handleTTSSubmit = async (e) => {
    e.preventDefault();
    setTtsLoading(true);
  
    const sentence = `Hey guys, my name is ${name}. I come from the city of ${city}. My job title is ${job}. I support ${team}, and my best interests are ${interests}.`;
  
    console.log("Constructed Sentence: ", sentence);
  
    await submitToTextToSpeechAPI(sentence, (audioUrl) => {
      console.log('TTS audio URL received:', audioUrl);
  
      setFolders((prevFolders) => {
        const updatedFolders = {
          ...prevFolders,
          music: [...prevFolders.music, audioUrl],
        };
        console.log('Updated folders.music:', updatedFolders.music);
        return updatedFolders;
      });
    });
  
    setTtsLoading(false);
    setIsTextToSpeech(false);
  };

  // Function to upload video to Cloudinary
  const uploadToCloudinary = async (videoBlob) => {
    const formData = new FormData();
    formData.append('file', videoBlob);
    formData.append('upload_preset', 'rwba17nn');
  
    try {
      console.log('Uploading to Cloudinary...');
      const response = await axios.post(`https://api.cloudinary.com/v1_1/dnryho2ce/video/upload`, formData);
      console.log('Cloudinary upload response:', response.data);
      setCloudinaryPublicId(response.data.public_id);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      setUploadError('Failed to upload video to Cloudinary. Please try again.');
    }
  };

  // Handle video generation
  const handleSubmit = async () => {
    setLoading(true);
  
    try {
      const media = Object.keys(folders).reduce((acc, key) => {
        if (key !== 'music' && folders[key].length > 0) {
          const randomIndex = Math.floor(Math.random() * folders[key].length);
          acc.push(folders[key][randomIndex]);
        }
        return acc;
      }, []);
      
      // If TTS is selected, use audioUrl; otherwise, select random music
      const music = isTextToSpeech
        ? audioUrl
        : folders.music.length > 0
          ? folders.music[Math.floor(Math.random() * folders.music.length)]
          : null;
  
      if (media.length === 0 || (!music && !audioUrl)) {
        alert('Please add at least one file to each folder and one music file.');
        setLoading(false);
        return;
      }

      const generateResponse = await axios.post('https://random-proj.vercel.app/api/video/generate', { media, music });
  
      const videoId = generateResponse.data.videoId;
      if (!videoId) throw new Error('Failed to retrieve videoId');
  
      const videoUrl = await pollVideoStatus(videoId);
  
      if (videoUrl) {
        const response = await fetch(videoUrl);
        const videoBlob = await response.blob();
        await uploadToCloudinary(videoBlob);  // Upload the generated video to Cloudinary
      } else {
        console.error('No video URL received after generation');
      }
  
    } catch (error) {
      console.error('Error submitting video generation:', error);
    } finally {
      setLoading(false);
    }
  };

  const pollVideoStatus = async (id) => {
    try {
      let statusResponse;
      let attempts = 0;
  
      // Poll every 10 seconds, up to 30 attempts
      do {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        statusResponse = await axios.get(`https://random-proj.vercel.app/api/video/status/${id}`);
        if (statusResponse.data.url) {
          setVideoUrl(statusResponse.data.url);
          return statusResponse.data.url;
        }
        attempts += 1;
      } while (attempts < 30);
  
      console.error('Video generation did not complete successfully.');
    } catch (error) {
      console.error('Error polling video status:', error.response?.data || error.message || error);
      setLoading(false);
    }
  };

  const handleGenerateSidebar = () => {
    setShowSidebarSection(true);
  };

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
    setTimerVisible(true);

    if (timer) {
      clearInterval(timer);
    }
    const newTimer = setInterval(handleRandomSelection, 900000);
    setTimer(newTimer);
  };

  useEffect(() => {
    console.log('Current cloudinaryPublicId:', cloudinaryPublicId);
  }, [cloudinaryPublicId]);

  useEffect(() => {
    console.log('Folders state updated in App:', folders);
  }, [folders]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar 
        key={foldersUpdateCount} // Add this key prop
        folders={folders} 
        setFolders={setFolders} 
        setIsTextToSpeech={setIsTextToSpeech} 
      />
      {/* Main Content */}
      <div className="flex-1 p-4 mr-16 flex flex-col items-center">
        <Notice />
        <div className="w-full max-w-3xl space-y-6">
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div className='flex justify-center'>
              <h1 className='text-xl font-semibold'>Video generating tool</h1>
            </div>
  
            {/* Show either TTS form or video generation button */}
            {isTextToSpeech ? (
              <form onSubmit={handleTTSSubmit} className="space-y-4 mt-4">
              {ttsLoading ? (
                <div className="loader">Loading...</div>  // Loader while waiting for TTS URL
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    onChange={(e) => setCity(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Team"
                    onChange={(e) => setTeam(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Job"
                    onChange={(e) => setJob(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Interests"
                    onChange={(e) => setInterests(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
                  >
                    Submit
                  </button>
                </>
              )}
            </form>
            ) : (
              Object.values(folders).some((folder) => folder.length > 0) && (
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
              )
            )}
          </div>
  
          {/* Video Preview and Effects */}
          {videoUrl && (
            <>
              <VideoPreview videoUrl={videoUrl} />
  
              {cloudinaryPublicId ? (
                <>
                  <CloudinaryVideoEffects publicId={cloudinaryPublicId} uploadToCloudinary={uploadToCloudinary} />
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
            <NewSidebar 
              folders={folders}
              setFolders={setFolders}
              initialThumbnails={initialThumbnails}
              setInitialThumbnails={setInitialThumbnails}
              setIsFinalized={setIsFinalized}
              setFinalSidebarImages={setFinalSidebarImages}
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

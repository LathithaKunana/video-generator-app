import React, { useState, useEffect } from "react";
import { FaVideo, FaSpinner } from "react-icons/fa";
import Sidebar from "./components/Sidebar";
import VideoPreview from "./components/VideoPreview";
import axios from "axios";
import Notice from "./components/Notice";
import NewSidebar from "./components/NewSidebar";
import FinalSidebar from "./components/FinalSidebar";
import Timer from "./components/Timer";
import CloudinaryVideoEffects from "./components/CloudinaryVideoEffect";
import CloudinaryImageEffects from "./components/CloudinaryImageEffects";

function App() {
  const [folders, setFolders] = useState({
    backgroundImage: [],
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
  const [editingImage, setEditingImage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isTextToSpeech, setIsTextToSpeech] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [team, setTeam] = useState("");
  const [job, setJob] = useState("");
  const [interests, setInterests] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [foldersUpdateCount, setFoldersUpdateCount] = useState(0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("en-US-1");
  const [editingImageUrl, setEditingImageUrl] = useState(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null); // Add this line
  const [isAddingBackground, setIsAddingBackground] = useState(false);

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await axios.get("https://random-proj.vercel.app/api/voices");
        setVoices(response.data);
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };

    fetchVoices();
  }, []);

  // Function to submit TTS data to your backend API
  const submitToTextToSpeechAPI = async (sentence, voiceCode) => {
    try {
      const response = await axios.post(
        "https://random-proj.vercel.app/api/texttospeech",
        {
          sentence,
          voice_code: voiceCode,
        }
      );

      if (response.data.audioUrl) {
        console.log("Audio URL received from API:", response.data.audioUrl);
        setAudioUrl(response.data.audioUrl);
        return response.data.audioUrl;
      } else {
        console.error("Failed to generate audio. No URL returned.");
        return null;
      }
    } catch (error) {
      console.error("Error submitting text to speech API:", error);
      return null;
    }
  };

  const handleTTSSubmit = async (e) => {
    e.preventDefault();
    setTtsLoading(true);

    const sentence = `Hey guys, my name is ${name}. I come from the city of ${city}. My job title is ${job}. I support ${team}, and my best interests are ${interests}.`;

    console.log("Constructed Sentence: ", sentence);

    // Await the audio URL after submission
    const audioUrl = await submitToTextToSpeechAPI(sentence, selectedVoice);

    if (audioUrl) {
      setFolders((prevFolders) => {
        const updatedFolders = {
          ...prevFolders,
          music: [...prevFolders.music, audioUrl],
        };
        console.log("Updated folders.music:", updatedFolders.music);
        return updatedFolders;
      });
    } else {
      console.error("Failed to add audio URL to the music folder");
    }

    setTtsLoading(false);
    setIsTextToSpeech(false);
  };

  const handleEditImage = (imageUrl) => {
    const publicId = imageUrl.split("/").pop().split(".")[0];
    setEditingImage(publicId);
    setEditingImageUrl(imageUrl);
  };

  const uploadToCloudinary = async (videoBlob) => {
    const formData = new FormData();
    formData.append("file", videoBlob);
    formData.append("upload_preset", "rwba17nn");

    try {
      console.log("Uploading to Cloudinary...");
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dnryho2ce/video/upload`,
        formData
      );
      console.log("Cloudinary upload response:", response.data);
      setCloudinaryPublicId(response.data.public_id);
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      setUploadError("Failed to upload video to Cloudinary. Please try again.");
    }
  };

  const handleUploadToCloudinary = async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "rwba17nn");

    try {
      console.log("Uploading to Cloudinary...");
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dnryho2ce/image/upload`,
        formData
      );
      console.log("Cloudinary upload response:", response.data);

      setFolders((prevFolders) => {
        const updatedFolders = { ...prevFolders };
        Object.keys(updatedFolders).forEach((folderName) => {
          const index = updatedFolders[folderName].indexOf(editingImageUrl);
          if (index !== -1) {
            updatedFolders[folderName][index] = response.data.secure_url;
          }
        });
        return updatedFolders;
      });

      setEditingImage(null);
      setEditingImageUrl(null);
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      setUploadError("Failed to upload image to Cloudinary. Please try again.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const media = Object.keys(folders).reduce((acc, key) => {
        if (
          key !== "music" &&
          key !== "backgroundImage" &&
          folders[key].length > 0
        ) {
          const randomIndex = Math.floor(Math.random() * folders[key].length);
          acc.push(folders[key][randomIndex]);
        }
        return acc;
      }, []);

      const backgroundImage =
        folders.backgroundImage.length > 0
          ? folders.backgroundImage[
              Math.floor(Math.random() * folders.backgroundImage.length)
            ]
          : null;

      const music = isTextToSpeech
        ? audioUrl
        : folders.music.length > 0
        ? folders.music[Math.floor(Math.random() * folders.music.length)]
        : null;

      if (media.length === 0 || (!music && !audioUrl)) {
        alert(
          "Please add at least one file to each folder and one music file."
        );
        setLoading(false);
        return;
      }

      const generateResponse = await axios.post(
        "https://random-proj.vercel.app/api/video/generate",
        { media, music, backgroundImage }
      );

      const videoId = generateResponse.data.videoId;
      if (!videoId) throw new Error("Failed to retrieve videoId");

      const videoUrl = await pollVideoStatus(videoId);

      if (videoUrl) {
        const response = await fetch(videoUrl);
        const videoBlob = await response.blob();
        await uploadToCloudinary(videoBlob);
        setGeneratedVideoUrl(videoUrl); // Add this line
      } else {
        console.error("No video URL received after generation");
      }
    } catch (error) {
      console.error("Error submitting video generation:", error);
    } finally {
      setLoading(false);
    }
  };

  const pollVideoStatus = async (id) => {
    try {
      let statusResponse;
      let attempts = 0;

      do {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        statusResponse = await axios.get(
          `https://random-proj.vercel.app/api/video/status/${id}`
        );
        if (statusResponse.data.url) {
          setVideoUrl(statusResponse.data.url);
          return statusResponse.data.url;
        }
        attempts += 1;
      } while (attempts < 30);

      console.error("Video generation did not complete successfully.");
    } catch (error) {
      console.error(
        "Error polling video status:",
        error.response?.data || error.message || error
      );
      setLoading(false);
    }
  };

  const handleAddBackground = async () => {
    // Add this function
    setIsAddingBackground(true);
    try {
      const response = await axios.post(
        "https://random-proj.vercel.app/api/overlay-videos",
        {
          backgroundVideoUrl: folders.backgroundImage[0], // Assuming there's always one background video
          generatedVideoUrl,
        }
      );

      const data = response.data; // Modify this line
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }
    } catch (error) {
      console.error("Error adding background:", error);
    } finally {
      setIsAddingBackground(false);
    }
  };

  const handleGenerateSidebar = () => {
    setShowSidebarSection(true);
  };

  const handleRandomSelection = () => {
    const updatedFolders = { ...folders };
    Object.keys(updatedFolders).forEach((folderName) => {
      const folder = updatedFolders[folderName];
      if (folder && folder.images && folder.images.length > 0) {
        const randomIndex = Math.floor(Math.random() * folder.images.length);
        folder.selectedImage = folder.images[randomIndex];
      }
    });
    setFolders(updatedFolders);

    const selectedImages = {};
    Object.keys(updatedFolders).forEach((folderName) => {
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
    console.log("Current cloudinaryPublicId:", cloudinaryPublicId);
  }, [cloudinaryPublicId]);

  useEffect(() => {
    console.log("Folders state updated in App:", folders);
  }, [folders]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar
        key={foldersUpdateCount}
        folders={folders}
        setFolders={setFolders}
        setIsTextToSpeech={setIsTextToSpeech}
        onEditImage={handleEditImage}
      />
      {/* Main Content */}
      <div className="flex-1 p-4 mr-16 flex flex-col items-center">
        {/* <Notice /> */}
        <div className="w-full max-w-3xl space-y-6">
          <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center">
              <h1 className="text-xl font-semibold">Video generating tool</h1>
            </div>
            {editingImage && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg max-w-3xl w-4/5 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">Edit Image</h2>
                  <CloudinaryImageEffects
                    publicId={editingImage}
                    uploadToCloudinary={handleUploadToCloudinary}
                  />
                  <button
                    onClick={() => {
                      setEditingImage(null);
                      setEditingImageUrl(null);
                    }}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Close Editor
                  </button>
                </div>
              </div>
            )}
            {/* Show either TTS form or video generation button */}
            {isTextToSpeech ? (
              <form onSubmit={handleTTSSubmit} className="space-y-4 mt-4">
                {ttsLoading ? (
                  <div className="loader">Loading...</div>
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

                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="p-2 border border-gray-300 rounded w-full"
                    >
                      {voices.map((voice) => (
                        <option key={voice.voice_code} value={voice.voice_code}>
                          {voice.language_name} - {voice.voice_gender} (
                          {voice.voice_type})
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 w-full"
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
                  className="flex items-center justify-center bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 w-full mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    "Generating..."
                  ) : (
                    <>
                      <FaVideo className="mr-2" /> Generate Video
                    </>
                  )}
                </button>
              )
            )}
            {generatedVideoUrl && ( // Add this block
              <button
                onClick={handleAddBackground}
                className="flex items-center justify-center bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 w-full mt-4"
              >
                {isAddingBackground ? (
                  <>
                    <FaSpinner className="inline-block mr-2 animate-spin" />
                    Adding background...
                  </>
                ) : (
                  "Add background"
                )}
              </button>
            )}
          </div>

          {videoUrl && (
            <>
              <VideoPreview videoUrl={videoUrl} />

              {cloudinaryPublicId ? (
                <>
                  <CloudinaryVideoEffects
                    publicId={cloudinaryPublicId}
                    uploadToCloudinary={uploadToCloudinary}
                  />
                  <button
                    onClick={handleGenerateSidebar}
                    className="flex items-center justify-center bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-600 w-full mt-4"
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
                className="random-select-btn bg-neutral-800 text-white p-2 rounded-lg"
              >
                Select Random Images
              </button>
            </div>
            {isFinalized && (
              <FinalSidebar finalSidebarImages={finalSidebarImages} />
            )}
            {timerVisible && <Timer duration={900000} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight, FaUpload, FaMusic, FaVideo, FaTrashAlt, FaSpinner, FaPlus, FaEdit } from "react-icons/fa";  // Import FaEdit
import axios from "axios";
import CloudinaryImageEffects from './CloudinaryImageEffects';  // Import the CloudinaryImageEffects component

const Sidebar = ({ folders, setFolders, setIsTextToSpeech, audioUrl, onEditImage  }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});
  const [combinedAudioUrl, setCombinedAudioUrl] = useState(null); // Store combined audio URL
  const [selectedImage, setSelectedImage] = useState(null);  // State to store the selected image for editing
  const [showImageEditor, setShowImageEditor] = useState(false);  // State to control the visibility of the image editor

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    console.log("Sidebar re-rendered with folders:", folders);
  }, [folders]);

  // Update music folder with the new audio URL
  useEffect(() => {
    if (audioUrl) {
      const updatedMusicFolder = [...folders.music, audioUrl];
      setFolders((prevFolders) => ({
        ...prevFolders,
        music: updatedMusicFolder,
      }));

      window.alert("Text-to-Speech audio has been added to the music folder successfully!");
    }
  }, [audioUrl, folders, setFolders]);

  // Handle file upload
  const handleUpload = async (folderName, files) => {
    setLoadingStates((prevState) => ({ ...prevState, [folderName]: true }));
    const updatedFolder = [...folders[folderName]];

    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "rwba17nn");

      try {
        const response = await axios.post("https://api.cloudinary.com/v1_1/dnryho2ce/upload", formData);
        updatedFolder.push(response.data.secure_url);

        if (folderName === "music") {
          window.alert(`${file.name} has been added to the music folder successfully!`);
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    setFolders({ ...folders, [folderName]: updatedFolder });
    setLoadingStates((prevState) => ({ ...prevState, [folderName]: false }));
  };

  // Handle audio combination
  const handleCombineAudio = async () => {
    const musicFolder = folders.music;
    const ttsUrl = musicFolder.find(url => url.includes('https://storage.googleapis.com'));
    const backgroundMusicUrl = musicFolder.find(url => !url.includes('https://storage.googleapis.com')); // Assuming only one background music
    
    if (ttsUrl && backgroundMusicUrl) {
      try {
        const response = await axios.post("https://random-proj.vercel.app/api/combine-audio", { ttsUrl, musicUrl: backgroundMusicUrl });
        const { combinedAudioUrl } = response.data;
        
        // Replace existing music folder content with the new combined audio URL
        setFolders((prevFolders) => ({
          ...prevFolders,
          music: [combinedAudioUrl],
        }));
        
        setCombinedAudioUrl(combinedAudioUrl);
        window.alert("TTS and background music combined successfully!");
      } catch (error) {
        console.error("Error combining audio:", error);
        window.alert("Failed to combine audio.");
      }
    } else {
      window.alert("Both TTS and background music are required to combine.");
    }
  };

  const handleDelete = (folderName, index) => {
    const updatedFolder = [...folders[folderName]];
    updatedFolder.splice(index, 1);
    setFolders({ ...folders, [folderName]: updatedFolder });
  };

  // Handle edit click for images
  const handleEdit = (image) => {
    if (typeof onEditImage === 'function') {
      onEditImage(image);
    } else {
      console.error('onEditImage is not a function');
    }
  };
  return (
    <div className={`flex ${isOpen ? "w-64" : "w-16"} transition-all duration-300 bg-gray-900 h-screen relative`}>
      <button onClick={toggleSidebar} className="absolute top-4 right-[-14px] bg-gray-900 p-2 rounded-full shadow-md text-white">
        {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
      </button>

      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 text-white">
          {Object.keys(folders).map((folderName) => (
            <div key={folderName} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{folderName}</h3>

              {folderName === "music" ? (
                <>
                  <div className="music-options mb-4">
                    <input id="background-music-upload" type="file" multiple onChange={(e) => handleUpload(folderName, Array.from(e.target.files))} className="hidden" />
                    <button onClick={() => document.getElementById("background-music-upload").click()} className="bg-blue-500 text-white p-2 rounded-lg mb-2 w-full">
                      Select Background Song
                    </button>
                    <button onClick={() => setIsTextToSpeech(true)} className="bg-yellow-500 text-white p-2 rounded-lg w-full">
                      Use Text-to-Speech
                    </button>
                  </div>

                  {/* Display Combine button when both TTS and music are available */}
                  {folders.music.length >= 2 && (
                    <button onClick={handleCombineAudio} className="bg-green-500 text-white p-2 rounded-lg w-full flex items-center justify-center">
                       Combine audio
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center mb-2">
                    <button onClick={() => document.getElementById(`file-upload-${folderName}`).click()} className="flex items-center bg-blue-500 p-2 rounded-lg text-white shadow-md hover:bg-blue-600" disabled={loadingStates[folderName]}>
                      {loadingStates[folderName] ? <FaSpinner className="mr-2 animate-spin" /> : <><FaUpload className="mr-2" /> Upload</>}
                    </button>
                    <input id={`file-upload-${folderName}`} type="file" multiple onChange={(e) => handleUpload(folderName, Array.from(e.target.files))} className="hidden" />
                  </div>
                </>
              )}

              {/* Thumbnails or icons */}
              <div className="grid grid-cols-3 gap-2">
                {folders[folderName].map((url, index) => {
                  const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);
                  const isVideo = url.match(/\.(mp4|mov|avi|webm|mkv)$/i);
                  const isAudio = url.match(/\.(mp3|wav)$/i);

                  let content;
                  if (isAudio) {
                    content = <div className="w-full h-20 flex items-center justify-center bg-gray-700 rounded-lg mt-2"><FaMusic className="text-white text-2xl" /></div>;
                  } else if (isImage) {
                    content = <img src={url} alt={`uploaded ${folderName}`} className="w-full h-20 object-cover rounded-lg" />;
                  } else if (isVideo) {
                    content = <div className="w-full h-20 flex items-center justify-center bg-gray-700 rounded-lg"><FaVideo className="text-white text-2xl" /></div>;
                  } else {
                    content = null;
                  }

                  return (
                    <div key={index} className="relative group">
                      {content}
                      <div className="absolute top-0 right-0 m-1 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete(folderName, index)} className="p-1 bg-red-500 text-white rounded-full text-sm">
                          <FaTrashAlt />
                        </button>
                        {isImage && (
                          <button onClick={() => handleEdit(url)} className="p-1 bg-blue-500 text-white rounded-full text-sm">
                            <FaEdit />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

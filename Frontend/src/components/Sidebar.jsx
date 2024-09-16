import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaUpload,
  FaMusic,
  FaVideo,
  FaTrashAlt,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";

const Sidebar = ({ folders, setFolders, setIsTextToSpeech, audioUrl }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});

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

      // Show success alert when TTS audio is added to the music folder
      window.alert("Text-to-Speech audio has been added to the music folder successfully!");
    }
  }, [audioUrl, folders, setFolders]);

  const handleUpload = async (folderName, files) => {
    setLoadingStates((prevState) => ({ ...prevState, [folderName]: true }));
  
    const updatedFolder = [...folders[folderName]];
    for (let file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "rc98zxhy");
  
      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dxhxijoo4/upload",
          formData
        );
        updatedFolder.push(response.data.secure_url);
  
        // Show success alert for music uploads
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

  const handleDelete = (folderName, index) => {
    const updatedFolder = [...folders[folderName]];
    updatedFolder.splice(index, 1);
    setFolders({ ...folders, [folderName]: updatedFolder });
  };

  return (
    <div
      className={`flex ${
        isOpen ? "w-64" : "w-16"
      } transition-all duration-300 bg-gray-900 h-screen relative`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-[-14px] bg-gray-900 p-2 rounded-full shadow-md text-white"
      >
        {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
      </button>
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 text-white">
          {Object.keys(folders).map((folderName) => (
            <div key={folderName} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{folderName}</h3>

              {folderName === "music" ? (
                <div className="music-options mb-4">
                  <input
                    id="background-music-upload"
                    type="file"
                    multiple
                    onChange={(e) =>
                      handleUpload(folderName, Array.from(e.target.files))
                    }
                    className="hidden"
                  />
                  <button
                    onClick={() =>
                      document.getElementById("background-music-upload").click()
                    }
                    className="bg-blue-500 text-white p-2 rounded-lg mb-2 w-full"
                  >
                    Select Background Song
                  </button>
                  <button
                    onClick={() => setIsTextToSpeech(true)}
                    className="bg-yellow-500 text-white p-2 rounded-lg w-full"
                  >
                    Use Text-to-Speech
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-2">
                    <button
                      onClick={() =>
                        document
                          .getElementById(`file-upload-${folderName}`)
                          .click()
                      }
                      className="flex items-center bg-blue-500 p-2 rounded-lg text-white shadow-md hover:bg-blue-600"
                      disabled={loadingStates[folderName]}
                    >
                      {loadingStates[folderName] ? (
                        <FaSpinner className="mr-2 animate-spin" />
                      ) : (
                        <>
                          <FaUpload className="mr-2" />
                          Upload
                        </>
                      )}
                    </button>
                    <input
                      id={`file-upload-${folderName}`}
                      type="file"
                      multiple
                      onChange={(e) =>
                        handleUpload(folderName, Array.from(e.target.files))
                      }
                      className="hidden"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {folders[folderName].map((url, index) => {
                      let content;
                      if (folderName === "music") {
                        if (url.endsWith(".mp3") || url.endsWith(".wav")) {
                          content = (
                            <div className="w-full h-20 flex items-center justify-center bg-gray-700 rounded-lg">
                              <FaMusic className="text-white text-2xl" />
                            </div>
                          );
                        }
                      } else if (
                        url.endsWith(".jpg") ||
                        url.endsWith(".jpeg") ||
                        url.endsWith(".png")
                      ) {
                        content = (
                          <img
                            src={url}
                            alt={`uploaded ${folderName}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        );
                      } else if (url.endsWith(".mp4") || url.endsWith(".mov")) {
                        content = (
                          <div className="w-full h-20 flex items-center justify-center bg-gray-700 rounded-lg">
                            <FaVideo className="text-white text-2xl" />
                          </div>
                        );
                      } else {
                        content = (
                          <div className="w-full h-20 bg-gray-700 rounded-lg"></div>
                        );
                      }

                      return (
                        <div key={index} className="relative">
                          {content}
                          <button
                            onClick={() => handleDelete(folderName, index)}
                            className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                            title="Delete"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

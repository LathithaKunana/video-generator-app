// Sidebar.jsx
import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaUpload, FaMusic, FaVideo, FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';

const Sidebar = ({ folders, setFolders }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleUpload = async (folderName, files) => {
    const updatedFolder = [...folders[folderName]];
    // Upload files to Cloudinary and get URLs
    for (let file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'rc98zxhy');

      try {
        const response = await axios.post('https://api.cloudinary.com/v1_1/dxhxijoo4/upload', formData);
        updatedFolder.push(response.data.secure_url);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
    setFolders({ ...folders, [folderName]: updatedFolder });
  };

  // Function to handle deletion of a file
  const handleDelete = (folderName, index) => {
    const updatedFolder = [...folders[folderName]];
    updatedFolder.splice(index, 1); // Remove the item at the specified index
    setFolders({ ...folders, [folderName]: updatedFolder });
  };

  return (
    <div className={`flex ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-gray-900 h-screen relative`}>
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
              <div className="flex items-center mb-2">
                <button
                  onClick={() => document.getElementById(`file-upload-${folderName}`).click()}
                  className="flex items-center bg-blue-950 p-2 rounded-lg text-white shadow-md hover:bg-blue-600"
                >
                  <FaUpload className="mr-2" />
                  Upload
                </button>
                <input
                  id={`file-upload-${folderName}`}
                  type="file"
                  multiple
                  onChange={(e) => handleUpload(folderName, Array.from(e.target.files))}
                  className="hidden"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {folders[folderName].map((url, index) => {
                  let content;
                  if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png')) {
                    content = <img src={url} alt={`uploaded ${folderName}`} className="w-full h-20 object-cover rounded-lg" />;
                  } else if (url.endsWith('.mp4') || url.endsWith('.mov')) {
                    content = (
                      <div className="w-full h-20 flex items-center justify-center bg-gray-700 rounded-lg">
                        <FaVideo className="text-white text-2xl" />
                      </div>
                    );
                  } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
                    content = (
                      <div className="w-full h-20 flex items-center justify-center bg-gray-700 rounded-lg">
                        <FaMusic className="text-white text-2xl" />
                      </div>
                    );
                  } else {
                    content = <div className="w-full h-20 bg-gray-700 rounded-lg"></div>;
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;

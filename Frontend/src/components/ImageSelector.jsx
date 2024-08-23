import React, { useState } from 'react';
import axios from 'axios';

const ImageSelector = ({ setImages }) => {
  // State to manage uploading status
  const [uploading, setUploading] = useState(false);

  // Handles media upload when files are selected
  const handleMediaUpload = async (e) => {
    // Convert the selected files to an array
    const files = Array.from(e.target.files);

    // Limit the number of files that can be uploaded at once
    if (files.length > 6) {
      alert("You can upload a maximum of 6 files (images/videos/GIFs) at a time.");
      return;
    }

    setUploading(true); // Set uploading state to true

    const uploadedMedia = []; // Array to hold successfully uploaded media URLs
    const failedUploads = []; // Array to hold names of files that failed to upload

    try {
      // Upload each file asynchronously
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData(); // Create a FormData object
          formData.append('file', file);
          formData.append('upload_preset', 'rc98zxhy'); // Use your Cloudinary upload preset

          // Determine the upload URL based on the file type
          const uploadUrl = file.type.startsWith('image/')
            ? `https://api.cloudinary.com/v1_1/dxhxijoo4/image/upload`  // Image upload endpoint
            : `https://api.cloudinary.com/v1_1/dxhxijoo4/video/upload`; // Video/GIF upload endpoint

          try {
            // Upload the file to Cloudinary
            const response = await axios.post(uploadUrl, formData);
            uploadedMedia.push(response.data.secure_url); // Add the uploaded file URL to the list
          } catch (uploadError) {
            failedUploads.push(file.name); // Add file name to the list of failed uploads
          }
        })
      );

      // Notify the user if some files failed to upload
      if (failedUploads.length > 0) {
        alert(`Failed to upload the following files: ${failedUploads.join(', ')}`);
      }

      // Update the parent component's state with the uploaded media URLs
      setImages(uploadedMedia);
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload some media. Please try again.');
    } finally {
      setUploading(false); // Set uploading state to false when done
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* File input label */}
      <label className="block text-gray-700 mb-2">Select Images/Videos/GIFs:</label>
      
      {/* File input field */}
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleMediaUpload}
        className="block w-full text-gray-500"
        disabled={uploading} // Disable the input while uploading
      />
      
      {/* Show uploading status */}
      {uploading && (
        <div className="mt-2 text-blue-500">Uploading media...</div>
      )}
    </div>
  );
};

export default ImageSelector;

import React, { useEffect, useState } from 'react';

const Notice = () => {
  const [showNotice, setShowNotice] = useState(true);

  useEffect(() => {
    if (showNotice) {
    //   alert("The app is still under construction. You can upload a maximum of 6 images at a time.");
    }
  }, [showNotice]);

  return (
    showNotice && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-700 mb-4">
            The app is still under construction. You can upload a maximum of 6 images at a time.
          </p>
          <button
            onClick={() => setShowNotice(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    )
  );
};

export default Notice;

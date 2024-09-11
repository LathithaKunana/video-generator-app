import React, { useState, useCallback } from 'react';
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedVideo } from '@cloudinary/react';
import { sepia, grayscale, blur, artisticFilter } from "@cloudinary/url-gen/actions/effect";
import { source } from "@cloudinary/url-gen/actions/overlay";
import { image } from "@cloudinary/url-gen/qualifiers/source";
import { opacity, brightness } from "@cloudinary/url-gen/actions/adjust";
import { FaSpinner } from 'react-icons/fa';
const cld = new Cloudinary({
  cloud: {
    cloudName: 'dnryho2ce'
  }
});

const effects = [
  { name: 'Sepia', value: 'sepia' },
  { name: 'Grayscale', value: 'grayscale' },
  { name: 'Blur', value: 'blur' },
  { name: 'Vignette', value: 'vignette' },
  { name: 'Watermark', value: 'watermark' },
  { name: 'Brighten', value: 'bright' },
];
//
const CloudinaryVideoEffects = ({ publicId, uploadToCloudinary }) => {
    const [effect, setEffect] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showEffects, setShowEffects] = useState(false);
    // Function to create a fresh copy of the original video
    const getOriginalVideo = () => cld.video(publicId).format('auto').quality('auto');
  
    const applyEffect = useCallback(async (effectValue) => {
      if (!publicId) {
        console.error('No valid video publicId');
        return;
      }
  
      setIsLoading(true);
      setEffect(effectValue);
  
      try {
        // Reset video to the original version
        let videoWithEffect = getOriginalVideo();
  
        // Apply the selected effect to the original video
        switch (effectValue) {
          case 'sepia':
            videoWithEffect.effect(sepia());
            break;
          case 'grayscale':
            videoWithEffect.effect(grayscale());
            break;
          case 'blur':
            videoWithEffect.effect(blur().strength(300));
            break;
          case 'vignette':
            videoWithEffect.effect(artisticFilter("vignette"));
            break;
          case 'watermark':
            videoWithEffect.overlay(
              source(image("sample")).opacity(50)
            );
            break;
          case 'bright':
            videoWithEffect.adjust(brightness().level(50));
            break;
          default:
            break;
        }
  
        // Fetch the modified video URL and re-upload it to Cloudinary
        const videoBlob = await fetch(videoWithEffect.toURL()).then(res => res.blob());
        await uploadToCloudinary(videoBlob);
  
      } catch (error) {
        console.error('Error applying effect:', error);
      } finally {
        setIsLoading(false);
      }
    }, [publicId, uploadToCloudinary]);
  
    return (
      <div className="relative">
        {publicId && (
          <AdvancedVideo cldVid={getOriginalVideo()} controls className="w-full" />
        )}
  
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <FaSpinner className="animate-spin text-white w-12 h-12" />
          </div>
        )}
  
        <div className="mt-4">
          <button
            onClick={() => setShowEffects(!showEffects)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showEffects ? 'Hide Effects' : 'Add Effect'}
          </button>
        </div>
  
        {showEffects && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {effects.map((e) => (
              <button
                key={e.value}
                onClick={() => applyEffect(e.value)}
                className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
              >
                {e.name}
              </button>
            ))}
            <button
              onClick={() => applyEffect('')}
              className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    );
  };
  
  
  

export default CloudinaryVideoEffects;
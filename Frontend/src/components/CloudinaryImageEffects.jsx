import React, { useState, useCallback } from 'react';
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from '@cloudinary/react';
import { sepia, grayscale, blur, artisticFilter, cartoonify,blackwhite } from "@cloudinary/url-gen/actions/effect";
import { source } from "@cloudinary/url-gen/actions/overlay";
import { image } from "@cloudinary/url-gen/qualifiers/source";
import { opacity, brightness } from "@cloudinary/url-gen/actions/adjust";
import { FaSpinner } from 'react-icons/fa';

// Initialize Cloudinary instance
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
  { name: 'Cartoonify', value: 'cartoonify' },
  { name: 'BW', value: 'blackwhite' },
];

const CloudinaryImageEffects = ({ publicId, uploadToCloudinary }) => {
  const [effect, setEffect] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

  // Function to create a fresh copy of the original image
  const getOriginalImage = () => {
    console.log("Fetching original image with publicId:", publicId); // Log publicId
    return cld.image(publicId).format('auto').quality('auto');
  };

  const applyEffect = useCallback(async (effectValue) => {
    if (!publicId) {
      console.error('No valid image publicId');
      return;
    }

    setIsLoading(true);
    setEffect(effectValue);

    try {
      // Reset image to the original version
      let imageWithEffect = getOriginalImage();

      // Apply the selected effect to the original image
      switch (effectValue) {
        case 'sepia':
          imageWithEffect.effect(sepia());
          break;
        case 'blackwhite':
          imageWithEffect.effect(blackwhite());
          break;
        case 'cartoonify':
          imageWithEffect.effect(cartoonify());
          break;
        case 'grayscale':
          imageWithEffect.effect(grayscale());
          break;
        case 'blur':
          imageWithEffect.effect(blur().strength(300));
          break;
        case 'vignette':
          imageWithEffect.effect(artisticFilter("vignette"));
          break;
        case 'watermark':
          imageWithEffect.overlay(
            source(image("sample")).opacity(50)
          );
          break;
        case 'bright':
          imageWithEffect.adjust(brightness().level(50));
          break;
        default:
          break;
      }

      const imageUrl = imageWithEffect.toURL();
      console.log('Generated image URL:', imageUrl); // Log the generated URL

      // Fetch the modified image URL and re-upload it to Cloudinary
      const imageBlob = await fetch(imageUrl)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch the modified image. Status: ${res.status}`);
          }
          return res.blob();
        });
      console.log('Fetched image blob successfully');

      // Uploading to Cloudinary
      await uploadToCloudinary(imageBlob);
      console.log('uploadToCloudinary function executed successfully');

    } catch (error) {
      console.error('Error applying effect or re-uploading:', error); // Log the error with details
    } finally {
      setIsLoading(false);
    }
  }, [publicId, uploadToCloudinary]);

  return (
    <div className="relative">
      {publicId && (
        <AdvancedImage cldImg={getOriginalImage()} className="w-full" />
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
          {/* <button
            onClick={() => applyEffect('')}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
          >
            Reset
          </button> */}
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageEffects;

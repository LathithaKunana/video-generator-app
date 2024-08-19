const express = require('express');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier'); // For streaming the buffer to Cloudinary
const { SHOTSTACK_API_KEY } = require('../config');


const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dnryho2ce',
  api_key: '254116947211962',
  api_secret: '_uMByDjHSgEukuG5L3aWQlaa1B8',
});

// Set up multer to handle file uploads, but without storing files locally
const upload = multer();

router.post('/generate', upload.fields([{ name: 'images' }, { name: 'music', maxCount: 1 }]), async (req, res) => {
  try {
    const images = req.files['images'];
    const music = req.files['music'][0];
  
    if (!images || images.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
  
    if (!music) {
      return res.status(400).json({ error: 'No music file uploaded' });
    }
  
    // Upload images to Cloudinary and get their URLs
    const imageUrls = await Promise.all(
      images.map((image) => new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(image.buffer).pipe(uploadStream);
      }))
    );
  
    // Upload music to Cloudinary
    const musicUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(music.buffer).pipe(uploadStream);
    });
  
    // Create request data for Shotstack API
    const requestData = {
      timeline: {
        background: '#000000',
        soundtrack: { src: musicUrl, effect: 'fadeInFadeOut' },
        tracks: [
          {
            clips: imageUrls.map((url, index) => ({
              asset: {
                type: 'image',
                src: url,
              },
              length: 3, // Duration of each image in the video
              start: index * 3, // Adjust start time to create a sequence
            })),
          },
        ],
      },
      output: {
        format: 'mp4',
        size: {
          width: 1024,
          height: 576,
        },
      },
    };
  
    console.log('Sending request to Shotstack:', JSON.stringify(requestData, null, 2));
  
    // Send request to Shotstack API
    const videoResponse = await axios.post(
      'https://api.shotstack.io/stage/render',
      requestData,
      { headers: { 'x-api-key': SHOTSTACK_API_KEY } }
    );
  
    console.log('Shotstack response:', JSON.stringify(videoResponse.data, null, 2));
  
    // Check if the video is still processing
    let statusResponse;
    do {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking status
      statusResponse = await axios.get(
        `https://api.shotstack.io/stage/render/${videoResponse.data.response.id}`,
        { headers: { 'x-api-key': SHOTSTACK_API_KEY } }
      );
      console.log('Video status:', JSON.stringify(statusResponse.data, null, 2));
    } while (statusResponse.data.response.status === 'processing');
  
    // Return the URL of the generated video to the frontend
    res.json({ videoUrl: statusResponse.data.response.url });
  } catch (error) {
    console.error('Error generating video:', error.response?.data || error.message || error);
    if (error.response && error.response.data && error.response.data.response && error.response.data.response.error) {
      console.error('Validation Error Details:', JSON.stringify(error.response.data.response.error.details, null, 2));
    }
    res.status(500).json({ error: 'Failed to generate video' });
  }
});

module.exports = router;


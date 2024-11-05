import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient({ apiKey: 'sk_fdfe725829b70eb97a4135d8859b42727b0b22fb307f1821' });

export const createVoice = async (name, files, removeBackgroundNoise, description, labels) => {
  try {
    const response = await client.voices.create({
      name,
      files,
      removeBackgroundNoise,
      description,
      labels,
    });
    return response;
  } catch (error) {
    console.error('Error creating voice:', error);
    throw error;
  }
};

export const fetchVoices = async () => {
  try {
    const voices = await client.voices.getAll();
    return voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
};
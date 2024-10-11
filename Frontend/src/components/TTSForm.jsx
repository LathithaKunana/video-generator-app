import React, { useState } from "react";

const TTS_FORMS = {
  UserIntro: {
    fields: [
      { name: "name", label: "Name" },
      { name: "superfanName", label: "SuperFan Name" },
      { name: "city", label: "City" },
    ],
    generateSentence: (data) =>
      `Hi, my name is ${data.name}. I go by the SuperFan name of ${data.superfanName}. I'm from ${data.city}.`,
  },
  MatchdayInfo: {
    fields: [
      { name: "team", label: "Team Supported" },
      { name: "favPlayers", label: "All Time Favourite Players" },
      { name: "currentFav", label: "Current Favourite Player" },
      { name: "matchUps", label: "Match Ups" },
    ],
    generateSentence: (data) =>
      `I'm a ${data.team} supporter. My 3 favourite players of all time are ${data.favPlayers}. My favourite player for this match is ${data.currentFav}. My respective Match Ups are ${data.matchUps}.`,
  },
  ProfessionalBand: {
    fields: [
      { name: "profession", label: "Profession" },
      { name: "position", label: "Position" },
      { name: "company", label: "Institution/Company" },
      { name: "specialization", label: "Products/Services" },
      { name: "experience", label: "Previous Experiences" },
      { name: "interests", label: "Current Fields of Interest" },
      { name: "contact", label: "Contact Details" },
    ],
    generateSentence: (data) =>
      `I'm a ${data.profession}, more specifically ${data.position} at ${data.company}. I specialize in ${data.specialization}. I've also got experience in ${data.experience}. My current fields of interests are ${data.interests}. Please contact me via ${data.contact}.`,
  },
  MatchdayActivities: {
    fields: [
      { name: "preMood", label: "Pre-match Mood" },
      { name: "liveMood", label: "Live Match Moods" },
      { name: "postMood", label: "Post Match Mood" },
    ],
    generateSentence: (data) =>
      `My pre-match mood was ${data.preMood}. My live match moods were ${data.liveMood}. My post-match mood is ${data.postMood}.`,
  },
  Favorites: {
    fields: [
      { name: "watchedWith", label: "Watched With" },
      { name: "shoutouts", label: "Shout-Outs" },
      { name: "enjoying", label: "Currently Enjoying" },
    ],
    generateSentence: (data) =>
      `I watched the match with ${data.watchedWith}. I would like to share this Matchday video with ${data.shoutouts}. Things I'm currently enjoying in life are ${data.enjoying}.`,
  },
  MusicVidSong: {
    fields: [{ name: "playlist", label: "Matchday Playlist" }],
    generateSentence: (data) =>
      `My playlist for this Matchday Video is ${data.playlist}.`,
  },
};

const TTSForm = ({ folderName, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({});
  const formConfig = TTS_FORMS[folderName];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sentence = formConfig.generateSentence(formData);
    onSubmit(sentence);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 bg-gray-700 p-4 rounded-lg">
      {formConfig.fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-white">
            {field.label}
          </label>
          <input
            type="text"
            name={field.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black p-2"
          />
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate TTS
        </button>
      </div>
    </form>
  );
};

export default TTSForm;

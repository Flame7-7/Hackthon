// frontend/src/components/Matching/FiltersModal.jsx
import React, { useState } from 'react';
import { X, Hash, Smile } from 'lucide-react';
import Modal from '../UI/Modal';

const TOPICS = [
  { id: 'general', label: '💬 General Chat', emoji: '💬' },
  { id: 'study', label: '📚 Study Help', emoji: '📚' },
  { id: 'rant', label: '😤 Vent/Rant', emoji: '😤' },
  { id: 'fun', label: '🎉 Just for Fun', emoji: '🎉' },
  { id: 'support', label: '🤝 Support', emoji: '🤝' },
  { id: 'gaming', label: '🎮 Gaming', emoji: '🎮' },
  { id: 'music', label: '🎵 Music', emoji: '🎵' },
  { id: 'tech', label: '💻 Tech', emoji: '💻' }
];

const MOODS = [
  { id: 'any', label: '😐 Any Mood', emoji: '😐' },
  { id: 'happy', label: '😊 Happy', emoji: '😊' },
  { id: 'stressed', label: '😰 Stressed', emoji: '😰' },
  { id: 'bored', label: '😴 Bored', emoji: '😴' },
  { id: 'curious', label: '🤔 Curious', emoji: '🤔' },
  { id: 'lonely', label: '😔 Lonely', emoji: '😔' }
];

const FiltersModal = ({ currentFilters, onSave, onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState(currentFilters.topic);
  const [selectedMood, setSelectedMood] = useState(currentFilters.mood);

  const handleSave = () => {
    onSave({
      topic: selectedTopic,
      mood: selectedMood
    });
  };

  return (
    <Modal onClose={onClose} title="Customize Your Chat Experience">
      <div className="space-y-6">
        {/* Topics */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Hash size={18} className="text-purple-400" />
            <h3 className="text-white font-semibold">Choose Topic</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-3 rounded-lg text-left transition ${
                  selectedTopic === topic.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{topic.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Moods */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Smile size={18} className="text-purple-400" />
            <h3 className="text-white font-semibold">Select Mood</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-3 rounded-lg text-left transition ${
                  selectedMood === mood.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{mood.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Apply Filters
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FiltersModal;
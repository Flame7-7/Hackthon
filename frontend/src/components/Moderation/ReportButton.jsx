// frontend/src/components/Moderation/ReportButton.jsx
import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import Modal from '../UI/Modal';

const REPORT_REASONS = [
  'Harassment or bullying',
  'Hate speech',
  'Inappropriate content',
  'Spam',
  'Impersonation',
  'Other'
];

const ReportButton = ({ username, onReport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (reason) {
      onReport(reason);
      setIsModalOpen(false);
      setSelectedReason('');
      setCustomReason('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-gray-400 hover:text-red-400 transition p-1"
        title="Report user"
      >
        <Flag size={16} />
      </button>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} title={`Report ${username}`}>
          <div className="space-y-4">
            <div className="text-sm text-gray-300">
              Help keep Ghost Protocol safe. Why are you reporting this user?
            </div>
            
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-purple-600"
                  />
                  <span className="text-gray-200">{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please provide more details..."
                className="w-full bg-gray-700 text-white rounded-lg p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                rows="3"
              />
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || (selectedReason === 'Other' && !customReason)}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition"
              >
                Submit Report
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ReportButton;
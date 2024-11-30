import React from 'react';

const NoteSection = ({ note, setNote }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-900">Additional Notes</h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm resize-none"
        placeholder="Add any additional information or special requests..."
      />
    </div>
  );
};

export default NoteSection;

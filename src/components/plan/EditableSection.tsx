'use client';

import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableSectionProps {
  title: string;
  content: string;
  isEditMode: boolean;
  onSave: (newContent: string) => void;
  className?: string;
}

const EditableSection: React.FC<EditableSectionProps> = ({
  title,
  content,
  isEditMode,
  onSave,
  className = ''
}) => {
  const [editedContent, setEditedContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  if (isEditMode && isEditing) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
              title="Save"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none"
          rows={6}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-start justify-between group">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {isEditMode && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">{content}</p>
    </div>
  );
};

export default EditableSection;

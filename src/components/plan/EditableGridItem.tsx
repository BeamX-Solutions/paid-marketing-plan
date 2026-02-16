'use client';

import React, { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableGridItemProps {
  title: string;
  content: string;
  isEditMode: boolean;
  onSave: (newContent: string) => void;
}

const EditableGridItem: React.FC<EditableGridItemProps> = ({
  title,
  content,
  isEditMode,
  onSave
}) => {
  const [editedContent, setEditedContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

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
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-semibold text-gray-900 text-sm">{title}</h5>
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-100 rounded transition"
              title="Save"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:bg-red-100 rounded transition"
              title="Cancel"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full p-2 border border-blue-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="h-full">
        <div className="flex items-start justify-between mb-2">
          <h5 className="font-semibold text-gray-900 text-sm">{title}</h5>
          {isEditMode && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition"
              title="Edit"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-gray-700 text-xs leading-relaxed">{content}</p>
      </div>
    </div>
  );
};

export default EditableGridItem;

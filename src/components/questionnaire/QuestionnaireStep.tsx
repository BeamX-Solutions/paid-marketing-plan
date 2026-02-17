'use client';

import React from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface QuestionnaireStepProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirst: boolean;
  isLast: boolean;
}

const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({
  question,
  value,
  onChange,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  isFirst,
  isLast
}) => {
  const handleInputChange = (newValue: any) => {
    onChange(newValue);
  };

  const handleMultiSelectChange = (option: string, checked: boolean) => {
    const currentValue = Array.isArray(value) ? value : [];
    if (checked) {
      if (question.maxSelections && currentValue.length >= question.maxSelections) {
        return;
      }
      onChange([...currentValue, option]);
    } else {
      onChange(currentValue.filter((item: string) => item !== option));
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 leading-tight">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        const atLimit = question.maxSelections ? selectedValues.length >= question.maxSelections : false;
        return (
          <div className="space-y-3">
            {question.maxSelections && (
              <p className="text-sm text-gray-500 mb-1">
                {selectedValues.length} of {question.maxSelections} selected
              </p>
            )}
            {question.options?.map((option) => {
              const isChecked = selectedValues.includes(option);
              const isDisabled = atLimit && !isChecked;
              return (
                <label key={option} className={cn("flex items-start space-x-3", isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={(e) => handleMultiSelectChange(option, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 leading-tight">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'range':
        return (
          <div>
            <input
              type="range"
              min="1"
              max="10"
              value={value || 5}
              onChange={(e) => handleInputChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>1</span>
              <span className="font-semibold">Current: {value || 5}</span>
              <span>10</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isValid = () => {
    if (!question.required) return true;
    
    switch (question.type) {
      case 'multiselect':
        return Array.isArray(value) && value.length > 0;
      case 'text':
      case 'textarea':
      case 'select':
      case 'radio':
        return value && value.toString().trim().length > 0;
      case 'range':
        return value !== undefined && value !== null;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {question.text}
          </h2>
          {question.helpText && (
            <p className="text-gray-600 text-sm bg-blue-50 p-4 rounded-lg">
              💡 {question.helpText}
            </p>
          )}
        </div>

        <div className="mb-8">
          {renderInput()}
        </div>

        <div className="flex justify-between items-center">
          <div>
            {canGoPrev && !isFirst && (
              <Button variant="outline" onClick={onPrev}>
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {question.required && !isValid() && (
              <span className="text-red-500 text-sm">This field is required</span>
            )}
            <Button
              onClick={onNext}
              disabled={question.required && !isValid()}
            >
              {isLast ? 'Generate Plan' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireStep;
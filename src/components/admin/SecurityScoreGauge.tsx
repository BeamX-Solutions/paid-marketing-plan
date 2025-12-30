'use client';

/**
 * Security Score Gauge Component
 *
 * Displays security score as a circular progress gauge with grade.
 * Visual representation of security posture (0-100).
 */

interface SecurityScoreGaugeProps {
  score: number;
  maxScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  size?: 'sm' | 'md' | 'lg';
  showGrade?: boolean;
}

export default function SecurityScoreGauge({
  score,
  maxScore,
  grade,
  size = 'md',
  showGrade = true,
}: SecurityScoreGaugeProps) {
  const percentage = Math.round((score / maxScore) * 100);

  // Determine color based on score
  const getColor = () => {
    if (percentage >= 90) return { stroke: '#10b981', text: 'text-green-600' }; // A - Green
    if (percentage >= 80) return { stroke: '#3b82f6', text: 'text-blue-600' }; // B - Blue
    if (percentage >= 70) return { stroke: '#f59e0b', text: 'text-amber-600' }; // C - Amber
    if (percentage >= 60) return { stroke: '#f97316', text: 'text-orange-600' }; // D - Orange
    return { stroke: '#ef4444', text: 'text-red-600' }; // F - Red
  };

  const color = getColor();

  // Size configurations
  const sizes = {
    sm: {
      dimension: 80,
      strokeWidth: 6,
      radius: 34,
      fontSize: 'text-lg',
      gradeSize: 'text-xs',
    },
    md: {
      dimension: 120,
      strokeWidth: 8,
      radius: 52,
      fontSize: 'text-2xl',
      gradeSize: 'text-sm',
    },
    lg: {
      dimension: 160,
      strokeWidth: 10,
      radius: 70,
      fontSize: 'text-4xl',
      gradeSize: 'text-lg',
    },
  };

  const config = sizes[size];
  const circumference = 2 * Math.PI * config.radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        <svg
          className="transform -rotate-90"
          width={config.dimension}
          height={config.dimension}
        >
          {/* Background circle */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={config.radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={config.radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${color.text} ${config.fontSize}`}>{score}</span>
          {showGrade && (
            <span className={`font-medium text-gray-500 ${config.gradeSize}`}>
              Grade {grade}
            </span>
          )}
        </div>
      </div>

      {/* Percentage label */}
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-500">{percentage}% Secure</p>
      </div>
    </div>
  );
}

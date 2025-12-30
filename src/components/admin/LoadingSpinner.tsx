'use client';

/**
 * Loading Spinner Component
 *
 * Reusable loading spinner with different sizes and variants.
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4 border-2';
      case 'md':
        return 'h-8 w-8 border-2';
      case 'lg':
        return 'h-12 w-12 border-2';
      case 'xl':
        return 'h-16 w-16 border-4';
      default:
        return 'h-8 w-8 border-2';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'border-blue-600 border-t-transparent';
      case 'white':
        return 'border-white border-t-transparent';
      case 'gray':
        return 'border-gray-600 border-t-transparent';
      default:
        return 'border-blue-600 border-t-transparent';
    }
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full ${getSizeClasses()} ${getColorClasses()}`}
      ></div>
      {text && (
        <p className={`mt-4 text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

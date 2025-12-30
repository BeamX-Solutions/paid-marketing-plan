'use client';

/**
 * Security Event Badge Component
 *
 * Reusable badge component for displaying event types and severity levels
 * with appropriate color coding.
 */

interface SecurityEventBadgeProps {
  type: 'severity' | 'eventType' | 'status';
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SecurityEventBadge({
  type,
  value,
  size = 'md',
}: SecurityEventBadgeProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    const lowerType = eventType.toLowerCase();

    if (lowerType.includes('failed') || lowerType.includes('suspicious')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (lowerType.includes('2fa') || lowerType.includes('security')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (lowerType.includes('login') || lowerType.includes('logout')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (lowerType.includes('rate_limit') || lowerType.includes('blocked')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (lowerType.includes('success') || lowerType.includes('verified')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'resolved':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'rejected':
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'severity':
        return getSeverityColor(value);
      case 'eventType':
        return getEventTypeColor(value);
      case 'status':
        return getStatusColor(value);
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'md':
        return 'px-2.5 py-1 text-sm';
      case 'lg':
        return 'px-3 py-1.5 text-base';
      default:
        return 'px-2.5 py-1 text-sm';
    }
  };

  const formatLabel = (label: string) => {
    return label
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${getColor()} ${getSizeClasses()}`}
    >
      {formatLabel(value)}
    </span>
  );
}

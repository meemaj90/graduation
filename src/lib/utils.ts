import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'h:mm a');
}

export function getHonorsBadgeColor(honors: string): string {
  switch (honors) {
    case 'Summa Cum Laude':
      return 'bg-yellow-400 text-yellow-900';
    case 'Magna Cum Laude':
      return 'bg-amber-300 text-amber-900';
    case 'Cum Laude':
      return 'bg-orange-300 text-orange-900';
    default:
      return 'bg-gray-200 text-gray-700';
  }
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

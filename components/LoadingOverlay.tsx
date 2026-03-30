'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

export function LoadingOverlay({
  isOpen,
  title = 'Processing...',
  description = 'Please wait while we work on your request',
}: LoadingOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

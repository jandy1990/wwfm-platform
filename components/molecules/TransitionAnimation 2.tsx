'use client';

import React, { useEffect } from 'react';
import { Bot, CheckCircle } from 'lucide-react';

interface TransitionAnimationProps {
  from: number;
  to: number;
  onComplete: () => void;
}

export function TransitionAnimation({
  from,
  to,
  onComplete
}: TransitionAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-8 animate-in fade-in zoom-in duration-500 max-w-md mx-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-center animate-out fade-out duration-1000">
              <Bot className="w-8 h-8 text-orange-500 mr-2" />
              <span className="text-lg">{from}★ AI-Generated</span>
            </div>
            <div className="flex items-center justify-center animate-in fade-in duration-1000 delay-1000">
              <CheckCircle className="w-8 h-8 text-purple-500 mr-2" />
              <span className="text-lg">{to}★ Community Verified</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-center">
            🎉 Community Verification Unlocked!
          </h3>

          <p className="text-gray-600 text-center text-sm">
            This solution now shows real user experiences.<br />
            Thanks for helping improve our data!
          </p>
        </div>
      </div>
    </div>
  );
}
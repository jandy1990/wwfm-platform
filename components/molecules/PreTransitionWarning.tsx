import React from 'react';
import { AlertTriangle, ArrowRight, Bot, CheckCircle } from 'lucide-react';

interface PreTransitionWarningProps {
  currentAI: number;
  projectedHuman: number;
}

export function PreTransitionWarning({
  currentAI,
  projectedHuman
}: PreTransitionWarningProps) {
  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <AlertTriangle className="h-4 w-4 text-orange-500 mr-3 mt-0.5" />
        <div className="space-y-2">
          <p className="font-medium text-orange-900">Your rating will unlock community verification!</p>
          <div className="flex items-center space-x-3 text-sm text-orange-800">
            <div className="flex items-center">
              <Bot className="w-3 h-3 mr-1" />
              <span>AI: {currentAI}★</span>
            </div>
            <ArrowRight className="h-3 w-3" />
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>Community: ~{projectedHuman}★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { submitFeedback } from '@/app/actions/feedback';
import { MessageSquare, X, ChevronRight, Check } from 'lucide-react';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const pathname = usePathname();

  // Check if widget should be hidden on certain pages
  const shouldHideWidget = () => {
    if (!pathname) return false;
    
    const hiddenPaths = ['/login', '/signup'];
    const hiddenPrefixes = ['/auth/', '/admin/'];
    
    return hiddenPaths.includes(pathname) || 
           hiddenPrefixes.some(prefix => pathname.startsWith(prefix));
  };

  // Reset form when pathname changes
  useEffect(() => {
    setIsOpen(false);
    setRating(0);
    setFeedbackText('');
    setEmail('');
    setSubmitted(false);
  }, [pathname]);

  // Don't render if on excluded pages
  if (shouldHideWidget()) {
    return null;
  }

  // Helper function to extract page context from pathname  
  const getPageContext = () => {
    // Goal pages: /goal/[id] or /goal/[id]/something
    if (pathname.includes('/goal/')) {
      const goalId = pathname.split('/goal/')[1]?.split('/')[0];
      return { 
        goal_id: goalId, 
        page_type: 'goal' as const
      };
    }
    
    // Solution pages: /solution/[id] (if they exist)
    if (pathname.includes('/solution/')) {
      const solutionId = pathname.split('/solution/')[1]?.split('/')[0];
      return { 
        solution_id: solutionId, 
        page_type: 'solution' as const
      };
    }
    
    // Arena pages: /arena/[slug] or category pages
    if (pathname.includes('/category/') || pathname.includes('/arena/')) {
      return { page_type: 'arena' as const };
    }
    
    // Everything else is general
    return { page_type: 'general' as const };
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    const pageContext = getPageContext();
    
    const result = await submitFeedback({
      rating: rating as 1 | 2 | 3 | 4 | 5,
      feedbackText: feedbackText.trim() || undefined,
      pageUrl: window.location.href,
      pagePath: pathname,
      pageContext,
      userEmail: email.trim() || undefined,
      sessionData: {
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || undefined
      }
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        // Reset after animation
        setTimeout(() => {
          setRating(0);
          setFeedbackText('');
          setEmail('');
          setSubmitted(false);
        }, 300);
      }, 2000);
    }
  };

  const ratingLabels = [
    'Not helpful',
    'Slightly helpful', 
    'Moderately helpful',
    'Very helpful',
    'Extremely helpful'
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center gap-2 group"
        aria-label="Give feedback"
      >
        <MessageSquare className="w-5 h-5 group-hover:mr-2" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Feedback
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          {/* Modal Content */}
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Share Your Feedback
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {!submitted ? (
                <>
                  {/* Rating Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      How helpful is WWFM to you?
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => setRating(value)}
                          className={`relative py-4 px-2 rounded-lg border-2 transition-all transform hover:scale-105 ${
                            rating === value
                              ? 'border-purple-500 bg-purple-50 scale-105 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          aria-label={`Rate ${value} - ${ratingLabels[value - 1]}`}
                        >
                          {rating === value && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-bounce-in">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-2xl mb-1">
                              {value === 1 && '😞'}
                              {value === 2 && '😕'}
                              {value === 3 && '😐'}
                              {value === 4 && '😊'}
                              {value === 5 && '🤩'}
                            </div>
                            <div className="text-xs text-gray-600 hidden sm:block">
                              {ratingLabels[value - 1]}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <div>
                    <label 
                      htmlFor="feedback-text" 
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Any other feedback you'd like to give us?
                      <span className="text-gray-400 font-normal ml-2">(Optional)</span>
                    </label>
                    <textarea
                      id="feedback-text"
                      rows={4}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                      placeholder="Tell us what you think..."
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label 
                      htmlFor="feedback-email" 
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email for follow-up
                      <span className="text-gray-400 font-normal ml-2">(Optional)</span>
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
                      ${rating === 0 || isSubmitting
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Feedback
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Page Context */}
                  <p className="text-xs text-gray-400 text-center">
                    Feedback for: {pathname}
                  </p>
                </>
              ) : (
                /* Success Message */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Thank you for your feedback!
                  </h3>
                  <p className="text-gray-600">
                    Your input helps us improve WWFM for everyone.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
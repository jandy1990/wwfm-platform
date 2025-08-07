// Shared components for solution forms
'use client';

// Progress celebration messages
export const ProgressCelebration = ({ step }: { step: number }) => {
  if (step === 1) return null;
  
  const celebrations = [
    "Great start! 🎯",
    "Almost there! 💪",
    "Final step! 🏁"
  ];
  
  return (
    <div className="text-center mb-4 opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]">
      <p className="text-green-600 dark:text-green-400 font-medium text-lg">
        {celebrations[step - 2]}
      </p>
    </div>
  );
};

// Form section header component
interface FormSectionHeaderProps {
  icon: string;
  title: string;
  bgColor?: string;
}

export const FormSectionHeader = ({ icon, title, bgColor = "bg-blue-100 dark:bg-blue-900" }: FormSectionHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}>
        <span className="text-lg">{icon}</span>
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
};

// Category icon mapping
export const CATEGORY_ICONS = {
  // Practice categories
  exercise_movement: '💪',
  meditation_mindfulness: '🧘',
  habits_routines: '📅',
  
  // Purchase categories  
  products_devices: '📱',
  books_courses: '📚',
  
  // Lifestyle categories
  diet_nutrition: '🥗',
  sleep: '😴',
  
  // Hobby categories
  hobbies_activities: '🎨',
  
  // Financial categories
  financial_tools: '💰',
  
  // Default fallback
  default: '⭐'
};
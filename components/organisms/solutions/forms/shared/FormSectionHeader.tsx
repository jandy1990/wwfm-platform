interface FormSectionHeaderProps {
  icon: string;
  title: string;
}

export const FormSectionHeader = ({ icon, title }: FormSectionHeaderProps) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
      <span className="text-lg">{icon}</span>
    </div>
    <h2 className="text-xl font-semibold">{title}</h2>
  </div>
);
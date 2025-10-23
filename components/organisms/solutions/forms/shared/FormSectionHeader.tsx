interface FormSectionHeaderProps {
  icon: string
  title: string
  bgColorClassName?: string
}

export const FormSectionHeader = ({ icon, title, bgColorClassName }: FormSectionHeaderProps) => (
  <div className="flex items-center gap-3">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center ${
        bgColorClassName ?? 'bg-blue-100 dark:bg-blue-900'
      }`}
    >
      <span className="text-lg">{icon}</span>
    </div>
    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
  </div>
);

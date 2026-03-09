interface ActivityButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const ActivityButton = ({ children, onClick, disabled }: ActivityButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full gradient-button text-primary-foreground font-medium text-base py-3.5 px-6 rounded-[var(--radius)] transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};

export default ActivityButton;

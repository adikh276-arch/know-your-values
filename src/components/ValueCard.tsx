interface ValueCardProps {
  emoji: string;
  name: string;
  selected: boolean;
  onClick: () => void;
}

const ValueCard = ({ emoji, name, selected, onClick }: ValueCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-[var(--radius)] transition-all duration-200 cursor-pointer border ${
        selected
          ? 'bg-accent border-primary/30 scale-[1.03]'
          : 'bg-card border-transparent shadow-card hover:shadow-lg'
      }`}
    >
      {selected && (
        <span className="absolute top-2 right-2 text-primary text-sm font-bold">✓</span>
      )}
      <span className="text-3xl">{emoji}</span>
      <span className="text-sm font-semibold text-foreground">{name}</span>
    </button>
  );
};

export default ValueCard;

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <p className="text-sm font-medium text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </p>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < currentStep
                ? 'bg-primary scale-110'
                : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;

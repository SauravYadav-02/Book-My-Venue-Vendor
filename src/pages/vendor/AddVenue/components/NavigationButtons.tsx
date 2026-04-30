type Props = {
  step: number;
  totalSteps: number;
  loading: boolean;
  isEditing: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel?: () => void;
};

export default function NavigationButtons({
  step,
  totalSteps,
  loading,
  isEditing,
  onBack,
  onNext,
  onCancel,
}: Props) {
  const isLast = step === totalSteps - 1;

  return (
    <div className="flex justify-between mt-4">
      <button onClick={onBack} disabled={step === 0}>
        Back
      </button>

      <button onClick={onNext} disabled={loading}>
        {loading
          ? "Saving..."
          : isLast
            ? isEditing
              ? "Update"
              : "Publish"
            : "Next"}
      </button>

      {onCancel && <button onClick={onCancel}>Cancel</button>}
    </div>
  );
}
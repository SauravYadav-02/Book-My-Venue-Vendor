type SuccessScreenProps = {
  isEditing: boolean;
  onReset: () => void;
};

export default function SuccessScreen({
  isEditing,
  onReset,
}: SuccessScreenProps) {
  return (
    <div className="text-center">
      <h2>
        {isEditing ? "Venue updated!" : "Venue published!"}
      </h2>

      <button onClick={onReset}>
        Add another venue
      </button>
    </div>
  );
}
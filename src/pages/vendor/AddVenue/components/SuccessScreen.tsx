type SuccessScreenProps = {
  isEditing: boolean;
  onReset: () => void;
};

function SuccessScreen({ isEditing, onReset }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-5 sm:gap-6 py-10 sm:py-12 md:py-16">

      {/* Icon ring — responsive size */}
      <div className={[
        "flex items-center justify-center rounded-full bg-emerald-50",
        "h-16 w-16 ring-8 ring-emerald-50/60",
        "sm:h-20 sm:w-20 md:h-24 md:w-24",
      ].join(" ")}>
        <svg
          className="text-emerald-500 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Text block */}
      <div className="flex flex-col gap-2">
        {/* Heading: xs=18px/bold → sm=22px/bold → md=26px/extrabold */}
        <h2 className="text-lg font-bold sm:text-2xl sm:font-bold md:text-[26px] md:font-extrabold text-slate-800">
          {isEditing ? "Venue updated!" : "Venue published!"}
        </h2>

        {/* Subtext: xs=12px → sm=13px → md=14px */}
        <p className="text-xs sm:text-[13px] md:text-sm font-normal sm:font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
          {isEditing
            ? "Your changes have been saved and are now live."
            : "Your venue is now live and ready to receive bookings."}
        </p>
      </div>

      {/* CTA button — responsive padding, size, weight */}
      <button
        type="button"
        onClick={onReset}
        className={[
          "flex items-center gap-2 rounded-xl bg-emerald-500 text-white",
          "shadow-sm shadow-emerald-500/30 hover:bg-emerald-600 transition-all duration-200 active:scale-95",
          // Responsive padding
          "px-5 py-2.5 sm:px-6 sm:py-3 md:px-7 md:py-3.5",
          // Responsive font size
          "text-xs sm:text-sm md:text-[15px]",
          // Responsive font weight
          "font-semibold sm:font-bold",
        ].join(" ")}
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add another venue
      </button>
    </div>
  );
}

export default SuccessScreen;
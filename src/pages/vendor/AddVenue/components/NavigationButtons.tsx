type NavProps = {
  step: number;
  totalSteps: number;
  loading: boolean;
  isEditing: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel?: () => void;
};

function NavigationButtons({
  step, totalSteps, loading, isEditing, onBack, onNext, onCancel,
}: NavProps) {
  const isLast = step === totalSteps - 1;
  const isFirst = step === 0;

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 pt-2">

      {/* Left group: Back + optional Cancel */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className={[
            "flex items-center gap-1 sm:gap-1.5 rounded-xl transition-all duration-200",
            // Responsive padding
            "px-3 py-2 sm:px-4 sm:py-2.5",
            // Responsive font size: xs=12px → sm=13px → md=14px
            "text-xs sm:text-[13px] md:text-sm",
            // Responsive font weight
            "font-medium sm:font-semibold",
            isFirst
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95",
          ].join(" ")}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {/* Hide text on xs, show from sm */}
          <span className="hidden sm:inline">Back</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={[
              "rounded-xl transition-all duration-200 active:scale-95",
              "px-3 py-2 sm:px-4 sm:py-2.5",
              "text-xs sm:text-[13px] md:text-sm",
              "font-medium sm:font-semibold",
              "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            ].join(" ")}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Right: Next / Publish / Update */}
      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className={[
          "flex items-center gap-1.5 sm:gap-2 rounded-xl transition-all duration-200 active:scale-95",
          // Responsive padding
          "px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3",
          // Responsive font size: xs=12px → sm=13px → md=14px → lg=15px
          "text-xs sm:text-[13px] md:text-sm lg:text-[15px]",
          // Responsive font weight: semibold → bold
          "font-semibold sm:font-bold",
          loading
            ? "bg-emerald-300 text-white cursor-not-allowed"
            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/25",
        ].join(" ")}
      >
        {loading ? (
          <>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {isEditing ? "Saving…" : "Publishing…"}
          </>
        ) : isLast ? (
          <>
            {isEditing ? "Update" : "Publish"}
            {/* Show full label from sm */}
            <span className="hidden sm:inline">{isEditing ? " venue" : " venue"}</span>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </>
        ) : (
          <>
            Next
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}

export default NavigationButtons;
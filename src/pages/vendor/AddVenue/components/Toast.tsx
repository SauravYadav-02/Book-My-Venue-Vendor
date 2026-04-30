function Toast({ message, show }: { message: string; show: boolean }) {
    if (!show) return null;
    return (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800
      rounded-xl px-4 py-3 text-sm mb-5 animate-pulse">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {message}
        </div>
    );
}

export default Toast;

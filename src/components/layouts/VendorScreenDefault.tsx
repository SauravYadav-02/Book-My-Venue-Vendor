

const VendorScreenDefault = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#eaf4ee] text-primary-light rounded-2xl flex items-center justify-center mb-4">
                <svg xmlns="https://i.pravatar.cc/40" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">Welcome to BookMyVenue</h2>
            <p className="text-gray-500 mt-2 max-w-md">Select an option from the sidebar to manage your listings, bookings, and dashboard analytics.</p>
        </div>
    )
}

export default VendorScreenDefault
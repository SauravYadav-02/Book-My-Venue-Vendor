import { useEffect, useState } from "react";
import { getVendorBookings, type Booking } from "../../services/bookingService";
import { currencyFormatter } from "../../utils/currency";

const CalendarPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        const vendorId = localStorage.getItem("vendorId");
        if (vendorId) {
            getVendorBookings(vendorId)
                .then((data) => setBookings(data.bookings || []))
                .catch(console.error);
        }
    }, []);

    const daysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const firstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    // Create array of days for the grid
    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        days.push(i);
    }

    // Check if a specific date has any approved bookings
    const getDateString = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const getBookingsForDateString = (dateStr: string) => {
        return bookings.filter(b => b.date === dateStr && b.status === "approved");
    };

    const getBookingsForDate = (day: number) => {
        return getBookingsForDateString(getDateString(day));
    };

    const selectedBookings = selectedDate ? getBookingsForDateString(selectedDate) : [];

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-max">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Booking Calendar</h1>
                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">&larr;</button>
                    <h2 className="text-lg font-semibold text-gray-700 w-36 text-center">{monthNames[month]} {year}</h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">&rarr;</button>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200"></div> Booked (Unavailable)
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-gray-50 border border-gray-200"></div> Available
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl border border-gray-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="bg-gray-50 py-3 text-center text-sm font-semibold text-gray-500">
                        {day}
                    </div>
                ))}
                
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="bg-white min-h-[100px]"></div>;
                    }

                    const dayBookings = getBookingsForDate(day);
                    const isBooked = dayBookings.length > 0;

                    const dateString = getDateString(day);

                    return (
                        <div 
                            key={`day-${day}`} 
                            onClick={() => setSelectedDate(dateString)}
                            className={`min-h-[100px] p-2 bg-white border-t border-gray-100 transition-colors cursor-pointer ${
                                isBooked ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-blue-50/30'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`font-medium text-sm ${isBooked ? 'text-red-700' : 'text-gray-700'}`}>
                                    {day}
                                </span>
                            </div>
                            
                            <div className="mt-2 space-y-1">
                                {dayBookings.map((b, i) => (
                                    <div key={i} className="text-[10px] px-1.5 py-1 bg-red-100 text-red-700 rounded truncate" title={`${b.venueId?.name} booked by ${b.userId?.name}`}>
                                        {b.venueId?.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Daily Detailed Bookings Modal */}
            {selectedDate && (
                <div 
                    className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedDate(null)}
                >
                    <div 
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Bookings for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedBookings.length} {selectedBookings.length === 1 ? 'venue booked' : 'venues booked'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedDate(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {selectedBookings.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    </div>
                                    <p className="text-gray-500 font-medium text-lg">No bookings on this day.</p>
                                    <p className="text-gray-400 text-sm mt-1">This date is fully available for reservations.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedBookings.map((b, idx) => (
                                        <div key={b._id || idx} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{b.venueId?.name || "Unknown Venue"}</h3>
                                                    <p className="text-sm font-medium text-emerald-600 bg-emerald-50 inline-flex px-2 py-0.5 rounded mt-1">Approved</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">{currencyFormatter.format(b.cost || 0)}</p>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Total Cost</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50">
                                                <div className="flex gap-3 items-start">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Customer</p>
                                                        <p className="text-sm font-semibold text-gray-800">{b.userId?.name || "N/A"}</p>
                                                        <p className="text-xs text-gray-500">{b.userId?.email || "No email provided"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 items-start">
                                                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Booking Details</p>
                                                        <p className="text-sm font-semibold text-gray-800">Booking ID: <span className="font-mono text-xs">{b._id?.slice(-8) || "N/A"}</span></p>
                                                        <p className="text-xs text-gray-500">Created: {new Date(b.createdAt || new Date()).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;

import { useEffect, useState } from "react";
import { getVendorBookings, type Booking } from "../../services/bookingService";

const CalendarPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

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
    const getBookingsForDate = (day: number) => {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bookings.filter(b => b.date === dateString && b.status === "approved");
    };

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

                    return (
                        <div 
                            key={`day-${day}`} 
                            className={`min-h-[100px] p-2 bg-white border-t border-gray-100 transition-colors ${
                                isBooked ? 'bg-red-50/50' : 'hover:bg-blue-50/30'
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
        </div>
    );
};

export default CalendarPage;

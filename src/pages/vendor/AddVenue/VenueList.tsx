import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVenuesByVendor, deleteVenue, type Venue } from "../../../services/venueService";
import VenueCard from "../EditVenues/components/VenueCard";
import { currencyFormatter } from "../../../utils/currency";

export default function VenueList() {
    const navigate = useNavigate();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (selectedVenue) {
            setCurrentImageIndex(0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedVenue]);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const vendorId = localStorage.getItem("vendorId");
            if (!vendorId) {
                setError("You must be logged in as a vendor to view your venues.");
                setLoading(false);
                return;
            }
            const data = await getVenuesByVendor(vendorId);
            setVenues(data);
        } catch {
            setError("Failed to load venues. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setDeleting(true);
            await deleteVenue(deleteId);
            setVenues((prev) => prev.filter((v) => v._id !== deleteId));
            setDeleteId(null);
        } catch {
            setError("Failed to delete venue.");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-400">Loading venues...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 sm:p-6 bg-slate-50/30">
            <div className="max-w-[1400px] mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My venues</h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {venues.length} listing{venues.length !== 1 ? "s" : ""} published
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/venue/add")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500
                            hover:bg-emerald-600 text-white text-sm font-semibold transition-all"
                    >
                        + Add venue
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm mb-6">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {venues.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <p className="text-slate-700 font-medium">No venues yet</p>
                        <p className="text-slate-400 text-sm mt-1">Add your first venue to get started.</p>
                        <button
                            onClick={() => navigate("/venue/add")}
                            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600
                                text-white text-sm font-semibold transition-all"
                        >
                            + Add your first venue
                        </button>
                    </div>
                ) : (
                    /* Cards grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                        {venues.map((venue) => (
                            <VenueCard
                                key={venue._id}
                                venue={venue}
                                onEdit={() => navigate(`/venue/edit/${venue._id}`)}
                                onDelete={() => setDeleteId(venue._id)}
                                onClick={() => setSelectedVenue(venue)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete confirmation modal */}
            {deleteId && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={() => setDeleteId(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-slate-800 text-center mb-1">
                            Delete venue?
                        </h2>
                        <p className="text-sm text-slate-400 text-center mb-6">
                            This action cannot be undone. The listing will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm
                                    font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600
                                    text-white text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details modal */}
            {selectedVenue && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedVenue(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedVenue(null)}
                            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="overflow-y-auto overflow-x-hidden w-full h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {/* Header Image */}
                            <div className="w-full h-64 bg-slate-100 relative group">
                                {selectedVenue.mediaFiles && selectedVenue.mediaFiles.length > 0 ? (
                                    <>
                                        <img 
                                            src={selectedVenue.mediaFiles[currentImageIndex].startsWith('http') || selectedVenue.mediaFiles[currentImageIndex].startsWith('data:') ? selectedVenue.mediaFiles[currentImageIndex] : `http://localhost:3000${selectedVenue.mediaFiles[currentImageIndex].startsWith('/') ? '' : '/'}${selectedVenue.mediaFiles[currentImageIndex]}`} 
                                            alt={`${selectedVenue.name} - image ${currentImageIndex + 1}`} 
                                            className="w-full h-full object-cover"
                                        />
                                        {selectedVenue.mediaFiles.length > 1 && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImageIndex((prev) => prev === 0 ? selectedVenue.mediaFiles.length - 1 : prev - 1);
                                                    }}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center text-slate-800 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-105 z-10"
                                                >
                                                    <svg className="w-4 h-4 ml-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImageIndex((prev) => (prev + 1) % selectedVenue.mediaFiles.length);
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center text-slate-800 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-105 z-10"
                                                >
                                                    <svg className="w-4 h-4 mr-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                                <div className="absolute bottom-[90px] left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    {selectedVenue.mediaFiles.map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-1.5 rounded-full transition-all shadow-sm ${
                                                                i === currentImageIndex ? 'bg-white w-4' : 'bg-white/60 hover:bg-white/90 w-1.5'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                                
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex gap-2 mb-2">
                                        {selectedVenue.status && (
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border border-white/20 backdrop-blur-sm
                                                ${selectedVenue.status === 'approved' ? 'bg-emerald-500 text-white' :
                                                selectedVenue.status === 'rejected' ? 'bg-rose-500 text-white' :
                                                'bg-amber-400 text-white'}`}>
                                                {selectedVenue.status.charAt(0).toUpperCase() + selectedVenue.status.slice(1)}
                                            </span>
                                        )}
                                        {selectedVenue.type && (
                                            <span className="text-xs font-semibold bg-white/95 text-slate-700 px-2.5 py-1 rounded-md shadow-sm border border-white backdrop-blur-sm">
                                                {selectedVenue.type}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-1 shadow-sm">{selectedVenue.name}</h2>
                                    <p className="text-white/90 flex items-center gap-1.5 text-sm font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {[selectedVenue.address, selectedVenue.city, selectedVenue.state, selectedVenue.country].filter(Boolean).join(", ")}
                                    </p>
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="p-6 md:p-8 flex flex-col gap-8 bg-white">
                                {/* Key Stats grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 items-center text-center">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">Capacity</p>
                                        <p className="font-semibold text-slate-800">{selectedVenue.capacity || "N/A"}</p>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 items-center text-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">Price/Day</p>
                                        <p className="font-semibold text-slate-800">{selectedVenue.pricePerDay ? currencyFormatter.format(Number(selectedVenue.pricePerDay)) : "N/A"}</p>
                                    </div>

                                    {selectedVenue.availableFrom && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 items-center text-center col-span-2 md:col-span-2">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">Available From</p>
                                            <p className="font-semibold text-slate-800">{new Date(selectedVenue.availableFrom).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {selectedVenue.description && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3">About this venue</h3>
                                        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                            {selectedVenue.description}
                                        </div>
                                    </div>
                                )}

                                {/* Amenities */}
                                {selectedVenue.amenities && selectedVenue.amenities.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">What this place offers</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                                            {selectedVenue.amenities.map(a => (
                                                <div key={a} className="flex items-center gap-2.5">
                                                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    <span className="text-sm text-slate-700 font-medium">{a}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Rejection Message */}
                                {selectedVenue.status === 'rejected' && selectedVenue.adminDescription && (
                                    <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl shadow-sm">
                                        <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2 mb-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            Rejection Reason
                                        </h3>
                                        <p className="text-sm text-rose-600 leading-relaxed font-medium">
                                            {selectedVenue.adminDescription}
                                        </p>
                                    </div>
                                )}
                                
                            </div>
                            
                            {/* Sticky Footer Actions */}
                            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 md:px-8 md:py-5 flex gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                                <button
                                    onClick={() => {
                                        setSelectedVenue(null);
                                        navigate(`/venue/edit/${selectedVenue._id}`);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Venue
                                </button>
                                <button
                                    onClick={() => {
                                        setDeleteId(selectedVenue._id);
                                        setSelectedVenue(null);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-white border border-rose-200 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Listing
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
import { useState, useEffect } from "react";
import type { Venue } from "../../../../services/venueService";
import { currencyFormatter } from "../../../../utils/currency";

interface VenueCardProps {
    venue: Venue;
    onEdit: () => void;
    onDelete: () => void;
    onClick?: () => void;
}

export default function VenueCard({ venue, onEdit, onDelete, onClick }: VenueCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!venue.mediaFiles || venue.mediaFiles.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % venue.mediaFiles.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [venue.mediaFiles]);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!venue.mediaFiles) return;
        setCurrentImageIndex((prev) => (prev === 0 ? venue.mediaFiles.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!venue.mediaFiles) return;
        setCurrentImageIndex((prev) => (prev + 1) % venue.mediaFiles.length);
    };
    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
        const baseUrl = 'http://localhost:3000';
        return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    };

    return (
        <div 
            onClick={onClick}
            className={`bg-white rounded-xl border border-slate-100/80 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col group/card ${onClick ? 'cursor-pointer' : ''}`}
        >
            {/* Image / placeholder */}
            <div className="h-44 bg-slate-50 flex items-center justify-center relative group overflow-hidden">
                {venue.mediaFiles && venue.mediaFiles.length > 0 ? (
                    <>
                        <img
                            src={getImageUrl(venue.mediaFiles[currentImageIndex])}
                            alt={`${venue.name} - ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                        />
                        {venue.mediaFiles.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center text-slate-800 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-105 z-10"
                                >
                                    <svg className="w-3 h-3 ml-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center text-slate-800 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-105 z-10"
                                >
                                    <svg className="w-3 h-3 mr-[-1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                {/* Dot indicators */}
                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    {venue.mediaFiles.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 rounded-full transition-all ${
                                                i === currentImageIndex ? 'bg-white w-2.5' : 'bg-white/60 hover:bg-white/90 w-1'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                        {/* Gradient overlay for better text legibility on top elements */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20 pointer-events-none" />
                    </>
                ) : (
                    <svg className="w-6 h-6 text-slate-300 group-hover/card:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                    </svg>
                )}
                {/* Type badge */}
                {venue.type && (
                    <span className="absolute top-2.5 left-2.5 text-[11px] font-semibold bg-white/95 backdrop-blur-sm
                        text-slate-700 px-2.5 py-1 rounded-md shadow-sm border border-white">
                        {venue.type}
                    </span>
                )}
                {/* Status badge */}
                {venue.status && (
                    <span className={`absolute top-2.5 right-2.5 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm
                        ${venue.status === 'approved' ? 'bg-emerald-500 text-white' :
                          venue.status === 'rejected' ? 'bg-rose-500 text-white' :
                          'bg-amber-400 text-white'} border border-white/20 backdrop-blur-sm`}>
                        {venue.status.charAt(0).toUpperCase() + venue.status.slice(1)}
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-3 flex-1">

                {/* Name + Location */}
                <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">{venue.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
                        {[venue.city, venue.state].filter(Boolean).join(", ")}
                    </p>
                </div>

                {/* Admin Message */}
                {venue.status === 'rejected' && venue.adminDescription && (
                    <div className="bg-rose-50/80 border border-rose-100/80 p-2.5 rounded-lg flex items-start gap-2 line-clamp-2">
                        <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-[11px] text-rose-600 font-medium leading-snug">
                            {venue.adminDescription}
                        </p>
                    </div>
                )}

                {/* Capacity + Price pills */}
                <div className="flex gap-2 flex-wrap mt-[2px]">
                    {venue.capacity && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium
                            bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded">
                            👥 {venue.capacity}
                        </span>
                    )}
                    {venue.pricePerDay && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium
                            bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded">
                            💰 {currencyFormatter.format(Number(venue.pricePerDay))}/day
                        </span>
                    )}
                </div>

                {/* Amenities */}
                {venue.amenities && venue.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-[2px]">
                        {venue.amenities.slice(0, 3).map((a) => (
                            <span key={a} className="text-[10px] bg-emerald-50/80 text-emerald-700 px-2 py-1
                                rounded font-medium border border-emerald-100/50">
                                {a}
                            </span>
                        ))}
                        {venue.amenities.length > 3 && (
                            <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded font-medium border border-slate-100">
                                +{venue.amenities.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Edit + Delete buttons */}
                <div className="flex gap-2 mt-auto pt-3 border-t border-slate-50">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                            border border-slate-200/80 bg-white shadow-sm text-xs font-semibold text-slate-700
                            hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                            border border-rose-100 bg-white shadow-sm text-xs font-semibold text-rose-600
                            hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
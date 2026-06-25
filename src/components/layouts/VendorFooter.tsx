
// Define brand icons locally with exact Lucide SVG paths & properties since brand icons 
// are officially removed in lucide-react v1.0+ to avoid trademark issues.
const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Linkedin = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function VendorFooter() {
  return (
    <footer className="w-full bg-[#F7F8F9] text-slate-600 py-6 px-8 mt-auto z-10 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* LEFT — Logo + Tagline */}
        <div className="text-center md:text-left">
          <h2 className="text-slate-900 font-semibold text-lg">Book My Venue</h2>
          <p className="text-slate-500 text-sm mt-0.5">Empowering vendors across India</p>
        </div>

        {/* RIGHT — Social Icons */}
        <div className="flex items-center gap-4">
          <a href="#" aria-label="Instagram" className="text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer">
            <Instagram size={18} />
          </a>
          <a href="#" aria-label="Facebook" className="text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer">
            <Facebook size={18} />
          </a>
          <a href="#" aria-label="Twitter" className="text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer">
            <Twitter size={18} />
          </a>
          <a href="#" aria-label="LinkedIn" className="text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer">
            <Linkedin size={18} />
          </a>
        </div>

      </div>

      {/* BOTTOM — Copyright bar */}
      <div className="max-w-7xl mx-auto border-t border-slate-200 mt-4 pt-4">
        <p className="text-slate-400 text-xs text-center">
          © 2026 Book My Venue. All rights reserved. | Made with ❤️ in India
        </p>
      </div>
    </footer>
  );
}

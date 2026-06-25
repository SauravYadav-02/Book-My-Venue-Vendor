import { useEffect, useState } from "react";
import { getActiveTerms } from "../../services/termsService";
import { Loader2 } from "lucide-react";

const Terms = () => {
  const [terms, setTerms] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const defaultTerms = [
    "Listing Accuracy: Vendors must provide truthful details, capacities, amenities, and real photos of their venues.",
    "Booking Confirmation: All booking requests must be accepted or declined within 24 hours of user submission.",
    "Cancellation Policy: Cancellations are subject to the standard user refund policy configured on the platform.",
    "Payment Settlements: Commission rates and payment schedules will follow the rules of your active subscription plan.",
    "Platform Quality Standards: Vendors must keep venues clean, safe, and available during confirmed booking times.",
    "Account Safety: Credentials must be kept confidential; any breach must be reported to the platform admin immediately."
  ];

  const getPoints = (rawContent: string) => {
    if (!rawContent) return [];
    if (rawContent.includes("<li>") || rawContent.includes("<ul>") || rawContent.includes("<ol>")) {
      return null;
    }
    const cleanText = rawContent
      .replace(/<[^>]*>/g, "")
      .replace(/\r/g, "");
    
    const lines = cleanText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 1) {
      return lines;
    }
    return cleanText
      .split(/(?<=\.)\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.match(/^\d+\.?$/));
  };

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await getActiveTerms();
        if (data.success && data.terms?.content) {
          setTerms(data.terms.content);
        }
      } catch (err: any) {
        console.error("Failed to fetch active terms, using default list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-brand-primary" />
        <span className="ml-2 text-gray-500 font-medium">Loading Terms & Conditions…</span>
      </div>
    );
  }

  const points = terms ? getPoints(terms) : defaultTerms;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <style>{`
        .terms-content {
          color: #4a5568;
          line-height: 1.7;
          font-size: 0.875rem;
        }
        .terms-content h1, .terms-content h2, .terms-content h3 {
          font-weight: 700;
          color: #1a202c;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .terms-content h1 { font-size: 1.5rem; }
        .terms-content h2 { font-size: 1.25rem; }
        .terms-content h3 { font-size: 1.125rem; }
        .terms-content p {
          margin-bottom: 1rem;
        }
        .terms-content ul {
          list-style-type: disc !important;
          margin-left: 1.5rem !important;
          margin-bottom: 1rem !important;
          padding-left: 0.25rem !important;
        }
        .terms-content ol {
          list-style-type: decimal !important;
          margin-left: 1.5rem !important;
          margin-bottom: 1rem !important;
          padding-left: 0.25rem !important;
        }
        .terms-content li {
          margin-bottom: 0.5rem !important;
          list-style-position: outside !important;
          display: list-item !important;
        }
        @media (min-width: 640px) {
          .terms-content {
            font-size: 1rem;
          }
          .terms-content h1 { font-size: 1.875rem; }
          .terms-content h2 { font-size: 1.5rem; }
          .terms-content h3 { font-size: 1.25rem; }
        }
      `}</style>
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-8 text-[#2d2d2d] tracking-tight border-b border-gray-100 pb-5">
          Terms & Conditions
        </h1>
        {points === null ? (
          <div className="terms-content" dangerouslySetInnerHTML={{ __html: terms }} />
        ) : (
          <div className="terms-content">
            <ol className="space-y-5 list-decimal pl-6">
              {points.map((point, index) => {
                const parts = point.split(":");
                if (parts.length > 1 && parts[0].length < 35) {
                  return (
                    <li key={index} className="text-gray-600 text-sm sm:text-base leading-relaxed pl-2">
                      <strong className="font-bold text-gray-800">{parts[0]}:</strong>
                      {parts.slice(1).join(":")}
                    </li>
                  );
                }
                return (
                  <li key={index} className="text-gray-600 text-sm sm:text-base leading-relaxed pl-2">
                    {point}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terms;

import { useEffect, useState } from "react";
import { getActiveTerms } from "../../services/termsService";
import { Loader2 } from "lucide-react";

const Terms = () => {
  const [terms, setTerms] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await getActiveTerms();
        // API returns { success: true, terms: {...} }
        if (data.success) {
          setTerms(data.terms.content);
        } else {
          setError(data.message || "Failed to load terms.");
        }
      } catch (err: any) {
        setError(err?.message || "Unexpected error while fetching terms.");
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
        <span className="ml-2">Loading Terms & Conditions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-extrabold mb-8 text-[#2d2d2d] tracking-tight border-b border-gray-100 pb-5">
          Terms & Conditions
        </h1>
        <div className="terms-content" dangerouslySetInnerHTML={{ __html: terms }} />
      </div>
    </div>
  );
};

export default Terms;

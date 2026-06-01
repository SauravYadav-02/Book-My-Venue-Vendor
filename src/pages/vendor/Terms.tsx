import React, { useEffect, useState } from "react";
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
      } catch (err) {
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
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-semibold mb-6 text-center">Terms & Conditions</h1>
      <div className="prose prose-sm sm:prose lg:max-w-none" dangerouslySetInnerHTML={{ __html: terms }} />
    </div>
  );
};

export default Terms;

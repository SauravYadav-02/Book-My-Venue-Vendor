import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getVendorById } from "../services/vendorService";

interface VendorContextType {
  vendor: any | null;
  loading: boolean;
  refreshVendor: (vendorId: string) => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendor, setVendor] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshVendor = useCallback(async (vendorId: string) => {
    setLoading(true);
    try {
      const data = await getVendorById(vendorId);
      setVendor(data);
    } catch (error) {
      console.error("Error fetching vendor profile details", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");
    if (vendorId) {
      void refreshVendor(vendorId);
    } else {
      setLoading(false);
    }
  }, [refreshVendor]);

  return (
    <VendorContext.Provider value={{ vendor, loading, refreshVendor }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendor = () => {
  const context = useContext(VendorContext);
  if (!context) throw new Error("useVendor must be used within VendorProvider");
  return context;
};

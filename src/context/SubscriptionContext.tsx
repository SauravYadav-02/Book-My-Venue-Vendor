import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getActivePlans,
  getCurrentSubscription,
  getSubscriptionQueue,
  createPaymentIntent,
  confirmPayment,
  type Plan,
  type Subscription,
  type SubscriptionQueueItem,
  type AddonSubscription,
  getMyAddons,
} from "../services/subscriptionService";
import toast from "react-hot-toast";

interface SubscriptionContextType {
  availablePlans: Plan[];
  currentSubscription: Subscription | null;
  addons: AddonSubscription[];
  queue: SubscriptionQueueItem[];
  loading: boolean;
  refreshData: (vendorId: string) => Promise<void>;
  createPayment: (vendorId: string, planId: string) => Promise<string>;
  confirmSubscription: (vendorId: string, transactionId: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [addons, setAddons] = useState<AddonSubscription[]>([]);
  const [queue, setQueue] = useState<SubscriptionQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Defined BEFORE useEffect so it can be safely referenced inside it
  const refreshData = useCallback(async (vendorId: string) => {
    setLoading(true);
    try {
      const [plansRes, subRes, queueRes, addonsRes] = await Promise.allSettled([
        getActivePlans(),
        getCurrentSubscription(vendorId),
        getSubscriptionQueue(vendorId),
        getMyAddons(vendorId),
      ]);

      if (plansRes.status === "fulfilled") setAvailablePlans(plansRes.value);
      if (subRes.status === "fulfilled") setCurrentSubscription(subRes.value);
      if (queueRes.status === "fulfilled") setQueue(queueRes.value);
      if (addonsRes.status === "fulfilled") setAddons(addonsRes.value);
    } catch (error) {
      console.error("Error fetching subscription data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");
    if (vendorId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void refreshData(vendorId);
    } else {
      setLoading(false);
    }
  }, [refreshData]);

  const createPayment = async (vendorId: string, planId: string): Promise<string> => {
    try {
      const res = await createPaymentIntent(vendorId, planId);
      return res.transactionId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to initialize payment.");
      throw error;
    }
  };

  const confirmSubscription = async (vendorId: string, transactionId: string): Promise<void> => {
    try {
      await confirmPayment(vendorId, transactionId);
      toast.success("Plan purchased successfully!");
      await refreshData(vendorId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Payment failed.");
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{ availablePlans, currentSubscription, addons, queue, loading, refreshData, createPayment, confirmSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
};

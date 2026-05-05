import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getActivePlans,
  getCurrentSubscription,
  getSubscriptionQueue,
  purchasePlan,
  type Plan,
  type Subscription,
  type SubscriptionQueueItem,
} from "../services/subscriptionService";
import toast from "react-hot-toast";

interface SubscriptionContextType {
  availablePlans: Plan[];
  currentSubscription: Subscription | null;
  queue: SubscriptionQueueItem[];
  loading: boolean;
  refreshData: (vendorId: string) => Promise<void>;
  buyPlan: (vendorId: string, planId: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [queue, setQueue] = useState<SubscriptionQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Defined BEFORE useEffect so it can be safely referenced inside it
  const refreshData = useCallback(async (vendorId: string) => {
    setLoading(true);
    try {
      const [plansRes, subRes, queueRes] = await Promise.allSettled([
        getActivePlans(),
        getCurrentSubscription(vendorId),
        getSubscriptionQueue(vendorId),
      ]);

      if (plansRes.status === "fulfilled") setAvailablePlans(plansRes.value);
      if (subRes.status === "fulfilled") setCurrentSubscription(subRes.value);
      if (queueRes.status === "fulfilled") setQueue(queueRes.value);
    } catch (error) {
      console.error("Error fetching subscription data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount if vendor is logged in
  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");
    if (vendorId) {
      refreshData(vendorId);
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only runs once on mount — refreshData is stable within this scope

  const buyPlan = async (vendorId: string, planId: string) => {
    try {
      await purchasePlan(vendorId, planId);
      toast.success("Plan purchased successfully!");
      await refreshData(vendorId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to purchase plan.");
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{ availablePlans, currentSubscription, queue, loading, refreshData, buyPlan }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
};

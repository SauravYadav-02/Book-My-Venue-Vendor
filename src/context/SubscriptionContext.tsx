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
  // New system functions and types
  getVendorPlans,
  getVendorSubscription,
  subscribeToPlan,
  type VendorPlan,
  type VendorSubscription,
  type PlanLimits,
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
  planLimits: PlanLimits | null;

  // ── New Subscription System State ──
  vendorPlans: VendorPlan[];
  vendorSubscription: VendorSubscription | null;
  venueUsage: number;
  fetchVendorSubscription: (vendorId: string) => Promise<void>;
  fetchVendorPlans: () => Promise<void>;
  subscribeToVendorPlan: (vendorId: string, planId: string, cycle: "monthly" | "yearly") => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [addons, setAddons] = useState<AddonSubscription[]>([]);
  const [queue, setQueue] = useState<SubscriptionQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);

  // New system states
  const [vendorPlans, setVendorPlans] = useState<VendorPlan[]>([]);
  const [vendorSubscription, setVendorSubscription] = useState<VendorSubscription | null>(null);
  const [venueUsage, setVenueUsage] = useState<number>(0);

  const fetchVendorSubscription = useCallback(async (vendorId: string) => {
    try {
      const res = await getVendorSubscription(vendorId);
      setVendorSubscription(res.subscription);
      setVenueUsage(res.venueUsage);
      if (res.planLimits) {
        setPlanLimits(res.planLimits);
      }
    } catch (error) {
      console.error("Error fetching vendor subscription:", error);
    }
  }, []);

  const fetchVendorPlans = useCallback(async () => {
    try {
      const plans = await getVendorPlans();
      setVendorPlans(plans);
    } catch (error) {
      console.error("Error fetching vendor plans:", error);
    }
  }, []);

  const subscribeToVendorPlan = async (vendorId: string, planId: string, cycle: "monthly" | "yearly") => {
    try {
      const paymentRef = `PAY-SIM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await subscribeToPlan(vendorId, planId, cycle, paymentRef);
      toast.success("Subscription activated successfully!");
      await fetchVendorSubscription(vendorId);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to subscribe.";
      toast.error(msg);
      throw error;
    }
  };

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
      if (subRes.status === "fulfilled") {
        setCurrentSubscription(subRes.value.subscription);
        if (subRes.value.planLimits) {
          setPlanLimits(subRes.value.planLimits);
        }
      }
      if (queueRes.status === "fulfilled") setQueue(queueRes.value);
      if (addonsRes.status === "fulfilled") setAddons(addonsRes.value);

      // Also refresh new subscription system data
      await Promise.allSettled([
        fetchVendorPlans(),
        fetchVendorSubscription(vendorId)
      ]);
    } catch (error) {
      console.error("Error fetching subscription data", error);
    } finally {
      setLoading(false);
    }
  }, [fetchVendorPlans, fetchVendorSubscription]);

  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");
    if (vendorId) {
      void refreshData(vendorId);
      void fetchVendorPlans();
      void fetchVendorSubscription(vendorId);
    } else {
      setLoading(false);
    }
  }, [refreshData, fetchVendorPlans, fetchVendorSubscription]);

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
      value={{
        availablePlans,
        currentSubscription,
        addons,
        queue,
        loading,
        refreshData,
        createPayment,
        confirmSubscription,
        planLimits,
        // New system properties
        vendorPlans,
        vendorSubscription,
        venueUsage,
        fetchVendorSubscription,
        fetchVendorPlans,
        subscribeToVendorPlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
};

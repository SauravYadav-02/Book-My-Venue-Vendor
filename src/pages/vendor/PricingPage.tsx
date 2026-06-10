import { useState, useEffect } from "react";
import { useSubscription } from "../../context/SubscriptionContext";
import { Check, Sparkles, Shield, RefreshCw, CheckCircle, X } from "lucide-react";

export default function PricingPage() {
  const { vendorPlans, vendorSubscription, fetchVendorPlans, fetchVendorSubscription, subscribeToVendorPlan } = useSubscription();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const vendorId = localStorage.getItem("vendorId") || "";

  useEffect(() => {
    void fetchVendorPlans();
    if (vendorId) {
      void fetchVendorSubscription(vendorId);
    }
  }, [fetchVendorPlans, fetchVendorSubscription, vendorId]);

  const handleOpenSubscribe = (plan: any) => {
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!vendorId || !selectedPlan) return;
    setIsPaying(true);
    try {
      // Simulate network latency for premium feel
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await subscribeToVendorPlan(vendorId, selectedPlan._id, isYearly ? "yearly" : "monthly");
      setPaymentSuccess(true);
      // Wait another second to close modal and refresh
      setTimeout(() => {
        setShowPaymentModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  // Check if vendor is currently subscribed to this plan with this cycle
  const isCurrentPlan = (planId: string) => {
    return (
      vendorSubscription &&
      vendorSubscription.planId?._id === planId &&
      vendorSubscription.status !== "expired"
    );
  };

  const isCurrentCycle = (planId: string) => {
    return (
      vendorSubscription &&
      vendorSubscription.planId?._id === planId &&
      vendorSubscription.cycle === (isYearly ? "yearly" : "monthly") &&
      vendorSubscription.status !== "expired"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 mb-4">
          Choose the Perfect Plan for Your Venues
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Scale your business, boost search visibility, and manage bookings seamlessly with our subscription tiers.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          <span className={`text-sm font-semibold transition-colors duration-200 ${!isYearly ? "text-indigo-400" : "text-slate-400"}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition-all duration-300 focus:outline-none"
            aria-label="Toggle Billing Cycle"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-indigo-500 transition-all duration-300 ${
                isYearly ? "translate-x-6 bg-pink-500" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-semibold transition-colors duration-200 ${isYearly ? "text-pink-400" : "text-slate-400"}`}>
            Yearly Billing
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-amber-500 text-white animate-pulse">
              Save Up to 25%
            </span>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {vendorPlans.map((plan) => {
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const cycleLabel = isYearly ? "/ year" : "/ month";
          const savingsPercent = Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100);
          const activeSub = isCurrentPlan(plan._id);
          const activeCycle = isCurrentCycle(plan._id);

          return (
            <div
              key={plan._id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 border bg-slate-900/60 backdrop-blur-md shadow-xl hover:shadow-2xl ${
                activeSub
                  ? "border-pink-500/80 shadow-pink-500/10 scale-105"
                  : "border-slate-800 hover:border-indigo-500/50"
              }`}
            >
              {/* Popular Tag */}
              {plan.name.toLowerCase().includes("pro") && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wider bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white uppercase shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Most Popular
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mt-4">
                    <span className="text-5xl font-extrabold text-white tracking-tight">${price}</span>
                    <span className="text-slate-400 ml-1 text-sm font-semibold">{cycleLabel}</span>
                  </div>
                  {isYearly && savingsPercent > 0 && (
                    <span className="mt-2 inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Save {savingsPercent}% compared to monthly
                    </span>
                  )}
                </div>

                {/* Plan Features */}
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
                    <span>Up to <strong className="text-white font-bold">{plan.maxVenues}</strong> Venue Listings</span>
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className={`w-5 h-5 mr-3 shrink-0 ${plan.visibilityBoost ? "text-indigo-400" : "text-slate-600"}`} />
                    <span className={plan.visibilityBoost ? "text-slate-200" : "text-slate-500 line-through"}>
                      Visibility boost in search results
                    </span>
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className={`w-5 h-5 mr-3 shrink-0 ${plan.customBranding ? "text-indigo-400" : "text-slate-600"}`} />
                    <span className={plan.customBranding ? "text-slate-200" : "text-slate-500 line-through"}>
                      Custom business branding
                    </span>
                  </li>
                  <li className="flex items-center text-slate-300 text-sm">
                    <Check className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
                    <span className="capitalize">
                      Support Tier: <strong className="text-white font-bold">{plan.supportTier}</strong> support
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <div>
                {activeSub ? (
                  activeCycle ? (
                    <button
                      disabled
                      className="w-full py-4 px-6 rounded-2xl font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 cursor-default"
                    >
                      <CheckCircle className="w-5 h-5" /> Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenSubscribe(plan)}
                      className="w-full py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-115 transition duration-200 shadow-lg"
                    >
                      Switch Billing Cycle
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleOpenSubscribe(plan)}
                    className="w-full py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/20 hover:shadow-lg transition duration-200"
                  >
                    Subscribe
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dummy Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-white">
            <button
              onClick={() => !isPaying && setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              disabled={isPaying}
            >
              <X className="w-6 h-6" />
            </button>

            {!paymentSuccess ? (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 mb-3">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Secure Dummy Payment</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Simulate your subscription to activate venue listings.
                  </p>
                </div>

                {/* Bill Summary */}
                <div className="bg-slate-850/50 rounded-2xl p-4 border border-slate-800 mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Plan Name</span>
                    <span className="font-semibold text-white">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Billing Cycle</span>
                    <span className="font-semibold text-white capitalize">{isYearly ? "Yearly" : "Monthly"}</span>
                  </div>
                  <div className="border-t border-slate-850 my-2 pt-2 flex justify-between text-base font-bold">
                    <span>Total Amount</span>
                    <span className="text-indigo-400">
                      ${isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice}
                    </span>
                  </div>
                </div>

                {/* Dummy Credit Card Info */}
                <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/80 mb-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Card Number</label>
                    <div className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-sm font-mono text-slate-300">
                      •••• •••• •••• 4242 (Demo Mode)
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Expiry</label>
                      <div className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-sm text-slate-300">
                        12/29
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CVV</label>
                      <div className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2.5 text-sm text-slate-300">
                        ***
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={handleConfirmPayment}
                  disabled={isPaying}
                  className="w-full py-4 px-6 rounded-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 text-white hover:brightness-110 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {isPaying ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Processing payment...
                    </>
                  ) : (
                    "Confirm & Pay (Simulated)"
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Payment Successful!</h3>
                <p className="text-sm text-slate-300 mt-2">
                  Your plan is now active. Refreshing your status...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

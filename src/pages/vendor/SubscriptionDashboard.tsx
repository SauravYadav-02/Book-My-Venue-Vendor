import { useEffect, useState } from "react";
import { useSubscription } from "../../context/SubscriptionContext";
import { Clock, AlertTriangle, CheckCircle, Package, Sparkles, Layers, ShieldCheck, X } from "lucide-react";
import { currencyFormatter } from "../../utils/currency";
import toast from "react-hot-toast";

export default function SubscriptionDashboard() {
  const { availablePlans, currentSubscription, addons, queue, loading, refreshData, createPayment, confirmSubscription, planLimits, venueUsage } = useSubscription();
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  // Fetch vendor ID precisely as stored by LoginPage.tsx
  const vendorId = localStorage.getItem("vendorId") || "";

  // Split plans into Regular (base) and Add-on plans
  const regularPlans = availablePlans.filter((plan) => !plan.planType || plan.planType === "base");
  const addonPlans = availablePlans.filter((plan) => plan.planType === "addon" || plan.planType === "full payment");

  const handleBuyPlan = async (planId: string) => {
    if (!vendorId) return;
    setProcessing(planId);
    try {
      const transactionId = await createPayment(vendorId, planId);
      const isConfirmed = window.confirm("Simulate Payment: Click OK to confirm payment, or Cancel to simulate failure.");
      if (isConfirmed) {
        await confirmSubscription(vendorId, transactionId);
      } else {
        toast.error("Payment was cancelled.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    if (vendorId) {
      refreshData(vendorId);
    }
  }, [vendorId, refreshData]);

  if (!vendorId) {
    return <div className="p-8 text-center text-red-500 font-medium">Authentication Error: Please log in to view your subscriptions.</div>;
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading subscription details...</div>;

  const calculateDaysRemaining = (endDate: string) => {
    const remaining = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return remaining > 0 ? remaining : 0;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>

      {/* --- Current Subscription Status Card --- */}
      <section className="bg-white p-6 rounded-xl border shadow-sm gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Plan</h2>
          {currentSubscription ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">
                  You are currently on the <span className="font-bold text-indigo-600">{currentSubscription.planSnapshot.name}</span> plan.
                </p>

                {/* Status Badge */}
                <div className="flex items-center gap-2 mt-2">
                  {(String(currentSubscription.status).toUpperCase() === "ACTIVE" || currentSubscription.status === "active") && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle size={16} className="mr-1.5" /> Active
                    </span>
                  )}
                  {(String(currentSubscription.status).toUpperCase() === "SUSPENDED" || currentSubscription.status === "grace") && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <AlertTriangle size={16} className="mr-1.5" /> Suspended (Grace Period)
                    </span>
                  )}
                  {String(currentSubscription.status).toUpperCase() === "EXPIRED" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <AlertTriangle size={16} className="mr-1.5" /> Expired
                    </span>
                  )}
                </div>

                {/* Countdowns & Alerts */}
                {(String(currentSubscription.status).toUpperCase() === "ACTIVE" || currentSubscription.status === "active") && (
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    <Clock size={16} className="mr-1" />
                    {calculateDaysRemaining(currentSubscription.endDate)} days remaining
                    {calculateDaysRemaining(currentSubscription.endDate) <= 5 && (
                      <span className="ml-2 text-red-500 font-semibold">(Expires soon!)</span>
                    )}
                  </p>
                )}
                {(String(currentSubscription.status).toUpperCase() === "SUSPENDED" || currentSubscription.status === "grace") && (
                  <p className="text-sm text-orange-600 mt-2 flex items-center">
                    <Clock size={16} className="mr-1" />
                    Ends in {calculateDaysRemaining(currentSubscription.graceEndDate || currentSubscription.endDate)} days. Renew now to prevent venue hiding.
                  </p>
                )}
                {String(currentSubscription.status).toUpperCase() === "EXPIRED" && (
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <AlertTriangle size={16} className="mr-1" />
                    Base plan expired. All venues are hidden and add-ons are suspended.
                  </p>
                )}
              </div>

              {/* Plan Limits Section */}
              {planLimits && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 block uppercase font-semibold">Venues Limit</span>
                    <span className="text-lg font-bold text-slate-800">
                      {venueUsage} / {planLimits.maxVenues} <span className="text-xs text-gray-500 font-normal">used</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block uppercase font-semibold">Photos Limit</span>
                    <span className="text-lg font-bold text-slate-800">
                      {planLimits.maxPhotos} <span className="text-xs text-gray-500 font-normal">per venue</span>
                    </span>
                  </div>
                </div>
              )}

              {/* ✅ Enriched subscription metadata from backend */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                {currentSubscription.vendorName && (
                  <p><span className="font-semibold text-gray-700">Vendor:</span> {currentSubscription.vendorName}</p>
                )}
                {currentSubscription.vendorEmail && (
                  <p><span className="font-semibold text-gray-700">Email:</span> {currentSubscription.vendorEmail}</p>
                )}
                {currentSubscription.adminName && (
                  <p><span className="font-semibold text-gray-700">Assigned by:</span> {currentSubscription.adminName}</p>
                )}
                {currentSubscription.startDate && (
                  <p><span className="font-semibold text-gray-700">Started:</span> {new Date(currentSubscription.startDate).toLocaleDateString('en-GB')}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 flex flex-col items-start gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Hidden / Expired
              </span>
              <p>You have no active plan. Your venues are currently hidden from public search.</p>
            </div>
          )}

          {/* --- Add-ons List --- */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">Add-ons</h3>
            {addons.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addons.map((addon) => {
                  const addonStatus = String(addon.status).toUpperCase();
                  return (
                    <li key={addon._id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 text-sm gap-2">
                      <div>
                        <span className="font-semibold text-gray-800">{addon.addonId?.name || "Add-on Upgrade"}</span>
                        <p className="text-xs text-gray-400">Expires: {new Date(addon.expiryDate).toLocaleDateString('en-GB')}</p>
                      </div>
                      <div>
                        {addonStatus === "ACTIVE" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                        {addonStatus === "SUSPENDED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" title={addon.suspensionReason || "Base Plan Expired"}>
                            Suspended - Base Plan Expired
                          </span>
                        )}
                        {addonStatus === "EXPIRED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Expired
                          </span>
                        )}
                        {addonStatus === "CANCELLED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">No active add-ons purchased.</p>
            )}
          </div>
        </div>
      </section>

      {/* --- Subscription Queue (Addons) --- */}
      {queue.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} /> Queued Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {queue.map((q, idx) => (
              <div key={q._id} className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
                <div className="text-xs font-semibold text-indigo-500 uppercase mb-1">Queue Position #{idx + 1}</div>
                <h3 className="font-bold text-gray-800">{q.planSnapshot.name}</h3>
                <p className="text-sm text-gray-600">{q.planSnapshot.duration_days} Days / {currencyFormatter.format(q.planSnapshot.price)}</p>
                <p className="text-xs text-gray-400 mt-2">Will auto-activate when current plan expires.</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Regular Subscriptions Section --- */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-brand-primary" size={24} />
            Regular Subscription Plans
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose a base subscription plan to unlock venue listing capabilities and scale your venue business.
          </p>
        </div>

        {regularPlans.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-500 shadow-sm">
            No regular subscription plans currently available.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {regularPlans.map((plan) => (
              <div
                key={plan._id}
                onClick={() => setSelectedPlan(plan)}
                className="border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all duration-200 bg-white flex flex-col relative overflow-hidden cursor-pointer"
              >
                {plan.name.toLowerCase().includes("pro") && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-brand-primary to-green-500" />
                )}

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 leading-tight">{plan.name}</h3>
                    <span className="inline-block px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-gray-100 text-gray-800 mt-1">
                      Base Plan
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{plan.duration_days} Days Access</p>

                <div className="mt-2 sm:mt-4 mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900">{currencyFormatter.format(plan.price)}</span>
                </div>

                {/* Plan limits block */}
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 sm:space-y-1.5 hidden md:block">
                  <div className="text-[9px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan Limits</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-slate-700 flex justify-between gap-1">
                    <span>Max Venues:</span>
                    <span className="font-bold">{plan.maxVenues || 0}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-slate-700 flex justify-between gap-1">
                    <span className="truncate" title="Max Photos / Venue">Max Photos/Venue:</span>
                    <span className="font-bold shrink-0">{plan.maxPhotos || 0}</span>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 md:mb-8 flex-1 hidden md:block">
                  {plan.features?.map((feature, i) => (
                    <li key={i} className="flex items-start text-[10px] sm:text-xs md:text-sm text-gray-600">
                      <CheckCircle className="text-brand-primary mr-1.5 sm:mr-2 shrink-0 mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyPlan(plan._id);
                  }}
                  disabled={processing === plan._id}
                  className="w-full py-2 sm:py-3 px-2 sm:px-4 bg-brand-primary hover:bg-brand-light disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex justify-center items-center cursor-pointer border-none text-xs sm:text-sm"
                >
                  {processing === plan._id ? "Processing..." : (currentSubscription && currentSubscription.status !== "expired" ? "Add to Queue" : "Activate Now")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Add-on Upgrade Plans Section --- */}
      <section className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={24} />
            Optional Add-on Plans
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Displaying all optional upgrades. Boost your venue listings with extra capacity that complements your base plans.
          </p>
        </div>

        {addonPlans.length === 0 ? (
          <div className="bg-white border border-dashed rounded-2xl p-8 text-center text-gray-400">
            No optional add-on upgrades currently available.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {addonPlans.map((plan) => (
              <div
                key={plan._id}
                onClick={() => setSelectedPlan(plan)}
                className="border border-indigo-100 rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 bg-gradient-to-b from-indigo-50/20 to-white flex flex-col relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 leading-tight">{plan.name}</h3>
                    <span className="inline-block px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-indigo-100 text-indigo-800 mt-1">
                      Upgrade Pack
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{plan.duration_days} Days Validity</p>

                <div className="mt-2 sm:mt-4 mb-4 sm:mb-6">
                  <span className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900">{currencyFormatter.format(plan.price)}</span>
                </div>

                {/* Parent plan / complement relationship */}
                {plan.parentPlanId ? (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl hidden md:block">
                    <div className="text-[9px] sm:text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles size={12} className="shrink-0 w-3 h-3" /> <span className="truncate">Complements Base Plan</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-indigo-700 leading-tight">
                      Enhances your active <strong className="font-bold text-indigo-900">{typeof plan.parentPlanId === "object" && plan.parentPlanId ? plan.parentPlanId.name : "matching"}</strong> plan.
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-xl hidden md:block">
                    <div className="text-[9px] sm:text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Layers size={12} className="shrink-0 w-3 h-3" /> <span className="truncate">Universal Upgrade</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-emerald-700 leading-tight">
                      Compatible with any active base subscription.
                    </p>
                  </div>
                )}

                {/* Plan limits block */}
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 sm:space-y-1.5 hidden md:block">
                  <div className="text-[9px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Upgrade Features</div>
                  {plan.maxVenues && plan.maxVenues > 0 ? (
                    <div className="text-[10px] sm:text-xs md:text-sm text-slate-700 flex justify-between gap-1">
                      <span className="truncate" title="Extra Venues Allowed">Extra Venues:</span>
                      <span className="font-bold text-indigo-600 shrink-0">+{plan.maxVenues}</span>
                    </div>
                  ) : null}
                  {plan.maxPhotos && plan.maxPhotos > 0 ? (
                    <div className="text-[10px] sm:text-xs md:text-sm text-slate-700 flex justify-between gap-1">
                      <span className="truncate" title="Extra Photos / Venue">Extra Photos/Venue:</span>
                      <span className="font-bold text-indigo-600 shrink-0">+{plan.maxPhotos}</span>
                    </div>
                  ) : null}
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 md:mb-8 flex-1 hidden md:block">
                  {plan.features?.map((feature, i) => (
                    <li key={i} className="flex items-start text-[10px] sm:text-xs md:text-sm text-gray-600">
                      <CheckCircle className="text-indigo-500 mr-1.5 sm:mr-2 shrink-0 mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyPlan(plan._id);
                  }}
                  disabled={processing === plan._id}
                  className="w-full py-2 sm:py-3 px-2 sm:px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex justify-center items-center cursor-pointer border-none shadow-sm shadow-indigo-100 text-xs sm:text-sm"
                >
                  {processing === plan._id ? "Processing..." : (currentSubscription && currentSubscription.status !== "expired" ? "Purchase Add-on" : "Activate Add-on")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Plan Detail Modal --- */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${
                  selectedPlan.planType === "addon" ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {selectedPlan.planType === "addon" ? "Upgrade Pack" : "Base Plan"}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{selectedPlan.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <span className="text-gray-500 text-sm">{selectedPlan.duration_days} Days Validity</span>
                <div className="text-3xl font-extrabold text-gray-900 mt-1">
                  {currencyFormatter.format(selectedPlan.price)}
                </div>
              </div>

              {/* Complement logic for Addons */}
              {selectedPlan.planType === "addon" && (
                selectedPlan.parentPlanId ? (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl">
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles size={12} /> Complements Base Plan
                    </div>
                    <p className="text-xs text-indigo-700">
                      Enhances your active <strong className="font-bold text-indigo-900">{typeof selectedPlan.parentPlanId === "object" && selectedPlan.parentPlanId ? selectedPlan.parentPlanId.name : "matching"}</strong> plan.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-xl">
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Layers size={12} /> Universal Upgrade
                    </div>
                    <p className="text-xs text-emerald-700">
                      Compatible with any active base subscription.
                    </p>
                  </div>
                )
              )}

              {/* Plan Limits block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {selectedPlan.planType === "addon" ? "Upgrade Features" : "Plan Limits"}
                </h4>
                {selectedPlan.planType === "addon" ? (
                  <>
                    {selectedPlan.maxVenues && selectedPlan.maxVenues > 0 ? (
                      <div className="text-sm text-slate-700 flex justify-between">
                        <span>Extra Venues Allowed:</span>
                        <span className="font-bold text-indigo-600">+{selectedPlan.maxVenues}</span>
                      </div>
                    ) : null}
                    {selectedPlan.maxPhotos && selectedPlan.maxPhotos > 0 ? (
                      <div className="text-sm text-slate-700 flex justify-between">
                        <span>Extra Photos / Venue:</span>
                        <span className="font-bold text-indigo-600">+{selectedPlan.maxPhotos}</span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="text-sm text-slate-700 flex justify-between">
                      <span>Max Venues Allowed:</span>
                      <span className="font-bold text-slate-900">{selectedPlan.maxVenues || 0}</span>
                    </div>
                    <div className="text-sm text-slate-700 flex justify-between">
                      <span>Max Photos / Venue:</span>
                      <span className="font-bold text-slate-900">{selectedPlan.maxPhotos || 0}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Full Features List */}
              {selectedPlan.features && selectedPlan.features.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Features Included</h4>
                  <ul className="space-y-3">
                    {selectedPlan.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start text-sm text-gray-600">
                        <CheckCircle className={`mr-2.5 shrink-0 mt-0.5 ${
                          selectedPlan.planType === "addon" ? "text-indigo-500" : "text-brand-primary"
                        }`} size={16} />
                        <span className="leading-normal">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer (Action Button) */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyPlan(selectedPlan._id);
                  setSelectedPlan(null);
                }}
                disabled={processing === selectedPlan._id}
                className={`w-full py-3 px-4 text-white rounded-xl font-semibold transition-colors flex justify-center items-center cursor-pointer border-none shadow-sm ${
                  selectedPlan.planType === "addon"
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                    : "bg-brand-primary hover:bg-brand-light"
                }`}
              >
                {processing === selectedPlan._id ? "Processing..." : (
                  selectedPlan.planType === "addon"
                    ? (currentSubscription && currentSubscription.status !== "expired" ? "Purchase Add-on" : "Activate Add-on")
                    : (currentSubscription && currentSubscription.status !== "expired" ? "Add to Queue" : "Activate Now")
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSubscription } from "../../context/SubscriptionContext";
import { Clock, AlertTriangle, CheckCircle, Package } from "lucide-react";
import { currencyFormatter } from "../../utils/currency";
import toast from "react-hot-toast";

export default function SubscriptionDashboard() {
  const { availablePlans, currentSubscription, addons, queue, loading, refreshData, createPayment, confirmSubscription, planLimits, venueUsage } = useSubscription();
  const [processing, setProcessing] = useState<string | null>(null);

  // Fetch vendor ID precisely as stored by LoginPage.tsx
  const vendorId = localStorage.getItem("vendorId") || "";

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

      {/* --- Available Plans Store --- */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Upgrade or Renew</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <div key={plan._id} className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.duration_days} Days Access</p>

              <div className="mt-4 mb-6">
                <span className="text-4xl font-extrabold text-gray-900">{currencyFormatter.format(plan.price)}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="text-green-500 mr-2 shrink-0" size={18} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuyPlan(plan._id)}
                disabled={processing === plan._id}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex justify-center items-center"
              >
                {processing === plan._id ? "Processing..." : (currentSubscription && currentSubscription.status !== "expired" ? "Add to Queue" : "Activate Now")}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

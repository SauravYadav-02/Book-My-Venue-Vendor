const fs = require('fs');
const file = 'd:/INTERNSHIP_PROJECT_TAG97/API_Book_My_Show/server/services/subscriptionService.js';
let content = fs.readFileSync(file, 'utf8');

// Replace purchasePlan and fullPaymentSubscription
content = content.replace(/export const purchasePlan = async \([\s\S]*?export const fullPaymentSubscription = async \([\s\S]*?export const assignSubscriptionByAdmin/m, `
export const createSubscriptionPayment = async (vendorId, planId) => {
  const plan = await getActivePlan(planId);

  const isFullPayment = isFullPaymentPlan(plan);
  if (!isBasePlan(plan) && !isFullPayment) {
    throw createError(400, "Invalid plan type.");
  }

  // Create pending payment history
  const paymentRecord = await createPaymentHistory({
    vendorId,
    type: isBasePlan(plan) ? "subscription" : "full payment",
    relatedId: plan._id, // temporarily use planId as relatedId until activated
    amount: plan.price,
    paymentStatus: "pending",
    transactionId: \`TXN-\${Date.now()}-\${Math.random().toString(36).slice(2, 10).toUpperCase()}\`,
    description: \`Pending payment for \${plan.name}\`,
  });

  return {
    message: "Payment intent created successfully.",
    transactionId: paymentRecord.transactionId,
    amount: plan.price,
  };
};

export const confirmSubscriptionPayment = async (vendorId, transactionId) => {
  const PaymentHistory = require("../models/PaymentHistoryModel.js").default;
  const paymentRecord = await PaymentHistory.findOne({ vendorId, transactionId, paymentStatus: "pending" });
  if (!paymentRecord) {
    throw createError(404, "Pending payment not found or already processed.");
  }

  const planId = paymentRecord.relatedId;
  const plan = await getActivePlan(planId);

  paymentRecord.paymentStatus = "success";
  paymentRecord.paymentTimestamp = new Date();
  await paymentRecord.save();

  if (isBasePlan(plan)) {
    const existingSub = await Subscription.findOne({ vendorId });
    if (existingSub) {
      await syncSubscriptionStatus(existingSub);
    }
    const hasActiveSub = existingSub && existingSub.status !== "expired";

    if (!hasActiveSub) {
      const sub = await activatePlan(vendorId, plan);
      paymentRecord.relatedId = sub._id;
      await paymentRecord.save();
      return {
        message: "Payment successful. Plan activated immediately.",
        subscription: await buildSubscriptionData(sub),
        queued: false,
      };
    }

    const lastQueueItem = await SubscriptionQueue.findOne(
      { vendorId, isActivated: false },
      null,
      { sort: { position: -1 } }
    );
    const nextPosition = lastQueueItem ? lastQueueItem.position + 1 : 1;

    const queueEntry = await SubscriptionQueue.create({
      vendorId,
      planId: plan._id,
      planSnapshot: buildPlanSnapshot(plan),
      position: nextPosition,
      isActivated: false,
      paymentStatus: "success",
      purchasedAt: new Date(),
    });

    paymentRecord.relatedId = queueEntry._id;
    await paymentRecord.save();

    return {
      message: "Payment successful. Plan added to queue.",
      queueEntry,
      queued: true,
    };
  } else {
    // Full payment
    const sub = await Subscription.findOne({ vendorId }).populate(
      "planId",
      "name price duration_days features planType"
    );

    if (!sub) {
      throw createError(404, "Vendor must have a base subscription before purchasing full-payments.");
    }

    await syncSubscriptionStatus(sub);
    if (sub.status === "expired") {
      throw createError(400, "Cannot add full-payments to an expired subscription.");
    }

    const { startDate: sd, endDate: ed } = buildDates(new Date(), plan.duration_days, null);

    sub.fullPayments.push({
      planId: plan._id,
      planSnapshot: buildPlanSnapshot(plan),
      status: "active",
      startDate: sd,
      endDate: ed,
      purchasedAt: new Date(),
    });

    await sub.save();
    await sub.populate("planId", "name price duration_days features planType");

    const addedFullPayment = sub.fullPayments[sub.fullPayments.length - 1];
    paymentRecord.relatedId = addedFullPayment._id;
    await paymentRecord.save();

    return {
      message: "Payment successful. Full payment activated.",
      subscription: await buildSubscriptionData(sub),
    };
  }
};

export const assignSubscriptionByAdmin`);

fs.writeFileSync(file, content);
console.log('Processed subscriptionService.js');

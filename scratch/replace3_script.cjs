const fs = require('fs');

// Update subscriptionRoutes.js
const routesFile = 'd:/INTERNSHIP_PROJECT_TAG97/API_Book_My_Show/server/Routes/subscriptionRoutes.js';
let routesContent = fs.readFileSync(routesFile, 'utf8');

routesContent = routesContent.replace(/import {[\s\S]*?} from "\.\.\/services\/subscriptionService\.js";/, `import {
  createSubscriptionPayment,
  confirmSubscriptionPayment,
  fullPaymentSubscriptionByAdmin,
  assignSubscriptionByAdmin,
  getAllSubscriptionsForAdmin,
  getQueue,
  getSubscription,
  getVendorSubscriptionForAdmin,
} from "../services/subscriptionService.js";`);

routesContent = routesContent.replace(/router\.post\("\/purchase"[\s\S]*?router\.post\("\/full-payment"[\s\S]*?}\);\n}\);/m, `router.post("/create-payment", isVendor, async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId || typeof planId !== "string" || planId.trim() === "") {
      return res.status(400).json({ success: false, message: "planId is required." });
    }
    const result = await createSubscriptionPayment(req.vendorId, planId.trim());
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});

router.post("/confirm-payment", isVendor, async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ success: false, message: "transactionId is required." });
    }
    const result = await confirmSubscriptionPayment(req.vendorId, transactionId);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
});`);

fs.writeFileSync(routesFile, routesContent);
console.log('Processed subscriptionRoutes.js');

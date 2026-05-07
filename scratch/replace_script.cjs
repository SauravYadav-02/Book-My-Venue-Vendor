const fs = require('fs');
const files = [
  'd:/INTERNSHIP_PROJECT_TAG97/API_Book_My_Show/server/services/subscriptionService.js',
  'd:/INTERNSHIP_PROJECT_TAG97/API_Book_My_Show/server/Routes/subscriptionRoutes.js',
  'd:/INTERNSHIP_PROJECT_TAG97/API_Book_My_Show/server/Routes/planRoutes.js'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/addOnSubscription/g, 'fullPaymentSubscription');
  content = content.replace(/addOns/g, 'fullPayments');
  content = content.replace(/addOn/g, 'fullPayment');
  content = content.replace(/AddOn/g, 'FullPayment');
  content = content.replace(/"addon"/g, '"full payment"');
  content = content.replace(/add-on/g, 'full-payment'); // for route endpoints
  fs.writeFileSync(file, content);
  console.log('Processed', file);
}

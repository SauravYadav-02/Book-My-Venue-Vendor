import { useState, useEffect } from 'react';
import SubscriptionDashboard from "./SubscriptionDashboard";
import { SubscriptionProvider } from "../../context/SubscriptionContext";

export default function SubscriptionPage() {
  return (
    <SubscriptionProvider>
      <SubscriptionDashboard />
    </SubscriptionProvider>
  );
}

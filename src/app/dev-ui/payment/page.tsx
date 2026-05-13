'use client';

import { PaymentPage } from '@/ux/features';

const TEST_DEAL_ID = 'demo-deal-001';

export default function PaymentRoute() {
  return <PaymentPage dealId={TEST_DEAL_ID} />;
}

const MERCHANT_SERVICE_URL = process.env.NEXT_PUBLIC_MERCHANT_SERVICE_URL || 'http://localhost:3001';
const PAYMENT_GATEWAY_URL = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || 'http://localhost:3002';
const SETTLEMENT_SERVICE_URL = process.env.NEXT_PUBLIC_SETTLEMENT_SERVICE_URL || 'http://localhost:3004';

// Hardcoded merchant ID for demo purposes
// In a real app, this would come from the authentication context/session
// Seeded merchant ID and API key matching prisma/seed.ts
export const MERCHANT_ID = '11111111-1111-1111-1111-111111111111';
export const API_KEY = 'sk_test_demo_1234567890abcdef';

const FALLBACK_PAYMENTS = [
  { id: 'pay_demo_9821a', orderId: 'ORD-982310', amount: 149900, currency: 'INR', method: 'card', status: 'CAPTURED', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'pay_demo_88321b', orderId: 'ORD-883219', amount: 49900, currency: 'INR', method: 'upi', status: 'CAPTURED', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'pay_demo_77210c', orderId: 'ORD-772108', amount: 2500000, currency: 'INR', method: 'netbanking', status: 'CAPTURED', createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: 'pay_demo_66192d', orderId: 'ORD-661920', amount: 149900, currency: 'INR', method: 'card', status: 'FAILED', createdAt: new Date(Date.now() - 28800000).toISOString() }
];

const FALLBACK_SETTLEMENTS = [
  { id: 'stl_demo_1092a', grossAmount: 2699800, gatewayFee: 53996, gst: 9719, netAmount: 2636085, status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000).toISOString() }
];

export async function fetchPayments() {
  try {
    const res = await fetch(`${PAYMENT_GATEWAY_URL}/api/v1/payments`, {
      headers: {
        'x-merchant-id': MERCHANT_ID,
        'Authorization': `Bearer ${API_KEY}`
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!res.ok) return { data: FALLBACK_PAYMENTS };
    return await res.json();
  } catch (error) {
    // If backend is unreachable (e.g. Vercel static hosting demo), return rich fallback data
    return { data: FALLBACK_PAYMENTS };
  }
}

export async function fetchSettlements() {
  try {
    const res = await fetch(`${SETTLEMENT_SERVICE_URL}/api/v1/settlements`, {
      headers: {
        'x-merchant-id': MERCHANT_ID,
        'Authorization': `Bearer ${API_KEY}`
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!res.ok) return { data: FALLBACK_SETTLEMENTS };
    return await res.json();
  } catch (error) {
    return { data: FALLBACK_SETTLEMENTS };
  }
}

export async function fetchMerchantProfile() {
  try {
    // Note: this assumes an endpoint like /api/v1/merchants/me exists
    const res = await fetch(`${MERCHANT_SERVICE_URL}/api/v1/merchants/${MERCHANT_ID}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch merchant profile:', error);
    return null;
  }
}

const MERCHANT_SERVICE_URL = process.env.NEXT_PUBLIC_MERCHANT_SERVICE_URL || 'http://localhost:3001';
const PAYMENT_GATEWAY_URL = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_URL || 'http://localhost:3002';
const SETTLEMENT_SERVICE_URL = process.env.NEXT_PUBLIC_SETTLEMENT_SERVICE_URL || 'http://localhost:3004';

// Hardcoded merchant ID for demo purposes
// In a real app, this would come from the authentication context/session
// Seeded merchant ID and API key matching prisma/seed.ts
export const MERCHANT_ID = '11111111-1111-1111-1111-111111111111';
export const API_KEY = 'sk_test_demo_1234567890abcdef';

export async function fetchPayments() {
  try {
    const res = await fetch(`${PAYMENT_GATEWAY_URL}/api/v1/payments`, {
      headers: {
        'x-merchant-id': MERCHANT_ID,
        'Authorization': `Bearer ${API_KEY}`
      },
      cache: 'no-store'
    });
    
    if (!res.ok) return { data: [] };
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return { data: [] };
  }
}

export async function fetchSettlements() {
  try {
    const res = await fetch(`${SETTLEMENT_SERVICE_URL}/api/v1/settlements`, {
      headers: {
        'x-merchant-id': MERCHANT_ID,
        'Authorization': `Bearer ${API_KEY}`
      },
      cache: 'no-store'
    });
    
    if (!res.ok) return { data: [] };
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch settlements:', error);
    return { data: [] };
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

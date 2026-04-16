export const CREDIT_PACKAGES = [
  { id: 'credit_1', name: '체험 1 크레딧', credits: 1, price: 500 },
  { id: 'credit_3', name: '소액 3 크레딧', credits: 3, price: 990 },
  { id: 'credit_7', name: '기본 7 크레딧', credits: 7, price: 2000 },
  { id: 'subscription_30', name: '월 구독 30 크레딧', credits: 30, price: 9900, isSubscription: true },
] as const;

export type PackageId = typeof CREDIT_PACKAGES[number]['id'];

export function getPackage(id: PackageId) {
  return CREDIT_PACKAGES.find(p => p.id === id);
}

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? '결제 승인 실패');
  }

  return response.json();
}
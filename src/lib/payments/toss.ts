import { PAYMENT_PACKAGES, getPackage, type PackageId } from './catalog';

export const CREDIT_PACKAGES = PAYMENT_PACKAGES.filter((pkg) =>
  ['credit_1', 'credit_3', 'credit_7', 'subscription_30'].includes(pkg.id)
);

export { getPackage, type PackageId };

export async function confirmPayment(paymentKey: string, orderId: string, amount: number) {
  if (!process.env.TOSS_SECRET_KEY) {
    throw new Error('TOSS_SECRET_KEY가 설정되어 있지 않습니다.');
  }

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

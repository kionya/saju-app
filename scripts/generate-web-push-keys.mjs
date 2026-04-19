import { generateKeyPairSync } from 'node:crypto';

function toBuffer(base64urlValue) {
  const padding = '='.repeat((4 - (base64urlValue.length % 4)) % 4);
  const normalized = (base64urlValue + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return Buffer.from(normalized, 'base64');
}

const { publicKey, privateKey } = generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
});

const publicJwk = publicKey.export({ format: 'jwk' });
const privateJwk = privateKey.export({ format: 'jwk' });

if (!publicJwk.x || !publicJwk.y || !privateJwk.d) {
  throw new Error('VAPID 키를 생성하지 못했습니다.');
}

const vapidPublicKey = Buffer.concat([
  Buffer.from([0x04]),
  toBuffer(publicJwk.x),
  toBuffer(publicJwk.y),
]).toString('base64url');

console.log('NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=' + vapidPublicKey);
console.log('WEB_PUSH_PRIVATE_KEY=' + privateJwk.d);
console.log('WEB_PUSH_SUBJECT=mailto:notifications@example.com');

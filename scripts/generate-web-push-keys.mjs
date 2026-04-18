import webPush from 'web-push';

const { publicKey, privateKey } = webPush.generateVAPIDKeys();

console.log('NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=' + publicKey);
console.log('WEB_PUSH_PRIVATE_KEY=' + privateKey);
console.log('WEB_PUSH_SUBJECT=mailto:notifications@example.com');

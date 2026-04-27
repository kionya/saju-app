import assert from 'node:assert/strict';
import { getProfileLinkageVerificationAudit } from './profile-linkage-audit';

declare const test: (name: string, fn: () => void) => void;

test('profile linkage audit exposes the current cross-service map', () => {
  const audit = getProfileLinkageVerificationAudit();

  assert.equal(audit.status, 'ready');
  assert.ok(audit.services.length >= 10);
  assert.ok(audit.services.some((service) => service.key === 'today-fortune' && service.status === 'ready'));
  assert.ok(audit.services.some((service) => service.key === 'compatibility' && service.usesFamilyProfiles));
  assert.ok(audit.services.some((service) => service.key === 'tarot' && service.status === 'partial'));
  assert.ok(audit.services.some((service) => service.key === 'star-sign' && service.usesSelfProfile));
  assert.ok(audit.services.some((service) => service.key === 'myeongri' && service.status === 'partial'));
});

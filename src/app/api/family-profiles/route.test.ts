import assert from 'node:assert/strict';
import { parseFamilyProfile } from './route-helpers';

declare const test: (name: string, fn: () => void) => void;

test('parseFamilyProfile accepts unified birth entry payload keys from family profile form', () => {
  const profile = parseFamilyProfile({
    label: '엄마',
    relationship: '부모',
    calendarType: 'solar',
    timeRule: 'standard',
    year: '1958',
    month: '4',
    day: '12',
    hour: '',
    minute: '',
    unknownBirthTime: true,
    gender: 'female',
    note: '',
  });

  assert.ok(profile);
  assert.equal(profile.birthYear, 1958);
  assert.equal(profile.birthMonth, 4);
  assert.equal(profile.birthDay, 12);
  assert.equal(profile.birthHour, null);
  assert.equal(profile.birthMinute, null);
});

test('parseFamilyProfile still accepts legacy birthYear payload keys', () => {
  const profile = parseFamilyProfile({
    label: '친구',
    relationship: '친구',
    birthYear: 1984,
    birthMonth: 8,
    birthDay: 2,
    birthHour: 7,
    birthMinute: 30,
    unknownBirthTime: false,
  });

  assert.ok(profile);
  assert.equal(profile.birthYear, 1984);
  assert.equal(profile.birthMonth, 8);
  assert.equal(profile.birthDay, 2);
  assert.equal(profile.birthHour, 7);
  assert.equal(profile.birthMinute, 30);
});

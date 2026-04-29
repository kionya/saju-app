import assert from 'node:assert/strict';
import { parseProfile } from './route-helpers';

declare const test: (name: string, fn: () => void) => void;

test('parseProfile accepts unified birth entry payload keys from MY profile form', () => {
  const profile = parseProfile({
    displayName: '민지',
    calendarType: 'lunar',
    timeRule: 'trueSolarTime',
    year: '1982',
    month: '1',
    day: '5',
    hour: '8',
    minute: '45',
    unknownBirthTime: false,
    birthLocationCode: 'seoul',
    birthLocationLabel: '서울',
    birthLatitude: '37.5665',
    birthLongitude: '126.9780',
    gender: 'female',
    note: '테스트',
  });

  assert.ok(profile);
  assert.equal(profile.birthYear, 1982);
  assert.equal(profile.birthMonth, 1);
  assert.equal(profile.birthDay, 5);
  assert.equal(profile.birthHour, 8);
  assert.equal(profile.birthMinute, 45);
  assert.equal(profile.calendarType, 'lunar');
  assert.equal(profile.timeRule, 'trueSolarTime');
  assert.equal(profile.solarTimeMode, 'longitude');
});

test('parseProfile still accepts legacy birthYear payload keys', () => {
  const profile = parseProfile({
    displayName: '민지',
    birthYear: 1982,
    birthMonth: 1,
    birthDay: 29,
    birthHour: 8,
    birthMinute: 45,
    unknownBirthTime: false,
  });

  assert.ok(profile);
  assert.equal(profile.birthYear, 1982);
  assert.equal(profile.birthMonth, 1);
  assert.equal(profile.birthDay, 29);
  assert.equal(profile.birthHour, 8);
  assert.equal(profile.birthMinute, 45);
});

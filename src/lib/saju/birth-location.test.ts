import assert from 'node:assert/strict';
import {
  buildBirthTimeCorrection,
  getBirthCalculationDateTime,
  getBirthLocationPreset,
  getSolarTimeOffsetMinutes,
} from './birth-location';

declare const test: (name: string, fn: () => void) => void;

test('longitude correction uses Korea standard meridian for Seoul', () => {
  assert.equal(getSolarTimeOffsetMinutes({ longitude: 126.978 }), -32);
});

test('birth time correction can move a Seoul birth across the previous day boundary', () => {
  const seoul = getBirthLocationPreset('seoul');
  assert.ok(seoul);

  const correction = buildBirthTimeCorrection({
    year: 1982,
    month: 1,
    day: 29,
    hour: 0,
    minute: 10,
    birthLocation: seoul,
    solarTimeMode: 'longitude',
  });

  assert.equal(correction?.offsetMinutes, -32);
  assert.deepEqual(correction?.adjustedBirth, {
    year: 1982,
    month: 1,
    day: 28,
    hour: 23,
    minute: 38,
  });
});

test('standard mode keeps the civil birth time unchanged', () => {
  const seoul = getBirthLocationPreset('seoul');
  const calculationTime = getBirthCalculationDateTime({
    year: 1982,
    month: 1,
    day: 29,
    hour: 0,
    minute: 10,
    birthLocation: seoul,
    solarTimeMode: 'standard',
  });

  assert.deepEqual(calculationTime, {
    year: 1982,
    month: 1,
    day: 29,
    hour: 0,
    minute: 10,
  });
});

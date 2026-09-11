import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseCalendar } from './build-profile.mjs';
import { activity, header, statistics, themes } from './profile-art.mjs';

function calendar(total = 3) {
  const days = Array.from({ length: 350 }, (_, i) => {
    const date = new Date(Date.UTC(2025, 0, i + 1)).toISOString().slice(0, 10);
    const count = i === 1 ? 1 : i === 349 ? 2 : 0;
    return `<td data-date="${date}" id="day-${i}" data-level="${count}" class="ContributionCalendar-day"></td><tool-tip for="day-${i}">${count || 'No'} contributions on date.</tool-tip>`;
  }).join('');
  return `<h2 id="js-contribution-activity-description">${total} contributions in the last year</h2>${days}`;
}

test('calendar preserves real day counts and zero days', () => {
  const parsed = parseCalendar(calendar());
  assert.equal(parsed.contributions, 3);
  assert.equal(parsed.days.length, 350);
  assert.equal(parsed.days.filter(day => day.count === 0).length, 348);
  assert.deepEqual(parsed.days.filter(day => day.count > 0).map(day => day.count), [1, 2]);
});

test('calendar fails on inconsistent totals or changed markup', () => {
  assert.throws(() => parseCalendar(calendar(50)), /total differs/);
  assert.throws(() => parseCalendar('<h2>unavailable</h2>'), /heading changed/);
  assert.throws(() => parseCalendar(calendar().replace('for="day-1"', 'for="missing"')), /Invalid calendar entry/);
});

test('public snapshot drives charts; artwork contains no external resources or scripts', async () => {
  const data = JSON.parse(await readFile(new URL('../assets/public-metrics.json', import.meta.url), 'utf8'));
  assert.equal(data.days.reduce((sum, day) => sum + day.count, 0), data.contributions);
  const charts = [header(), statistics(themes.dark, data), activity(themes.dark, data)];
  for (const chart of charts) {
    assert.doesNotMatch(chart, /<script|<foreignObject|(?:href|src)="https?:/i);
    assert.match(chart, /prefers-reduced-motion/);
  }
  assert.match(header(), /animateMotion/);
  assert.match(charts[1], new RegExp(`${data.repositories} репозиториев`));
});

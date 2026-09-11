import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { activity, button, header, highlights, projectLabel, stack, statistics, themes } from './profile-art.mjs';

const USER = 'AlexChek51';
const ASSETS = fileURLToPath(new URL('../assets/', import.meta.url));
const apiHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': `${USER}-profile`,
  'X-GitHub-Api-Version': '2022-11-28',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function getJson(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: apiHeaders,
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
  return response.json();
}

async function getRepositories() {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await getJson(`/users/${USER}/repos?type=owner&per_page=100&page=${page}`);
    if (!Array.isArray(batch)) throw new Error('Unexpected repository response');
    repos.push(...batch);
    if (batch.length < 100) return repos;
  }
}

const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];

export function parseCalendar(html) {
  const heading = html.match(/<h2\b[^>]*id="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/i);
  const count = heading?.[1].replace(/<[^>]*>/g, '').match(/([\d,]+)\s+contributions?\b/i);
  if (!count) throw new Error('Contribution heading changed; preserve previous graphics');
  const contributions = Number(count[1].replaceAll(',', ''));
  const tooltips = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/gi)) {
    const target = attribute(match[1], 'for');
    const tooltipCount = match[2].replace(/<[^>]*>/g, '').trim().match(/^(No|[\d,]+) contributions?\b/i);
    if (target && tooltipCount) tooltips.set(target, tooltipCount[1] === 'No' ? 0 : Number(tooltipCount[1].replaceAll(',', '')));
  }
  const days = [];
  for (const match of html.matchAll(/<td\b[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/gi)) {
    const date = attribute(match[0], 'data-date');
    const id = attribute(match[0], 'id');
    const level = Number(attribute(match[0], 'data-level'));
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const dayCount = tooltips.get(id);
    if (!Number.isInteger(dayCount) || !Number.isInteger(level) || level < 0 || level > 4) throw new Error(`Invalid calendar entry: ${date}`);
    days.push({ date, count: dayCount, level });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  if (days.length < 350 || days.length > 371 || new Set(days.map(day => day.date)).size !== days.length) throw new Error('Incomplete or duplicate calendar dates');
  if (days.reduce((sum, day) => sum + day.count, 0) !== contributions) throw new Error('Calendar total differs from its day counts');
  return { contributions, days };
}

async function getPublicCalendar() {
  // No auth here: only the activity visible to a public profile visitor.
  const response = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { 'User-Agent': `${USER}-profile`, 'Accept-Language': 'en-US,en;q=0.9' },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Public calendar: ${response.status}`);
  return parseCalendar(await response.text());
}

async function fetchData() {
  const [profile, repos, calendar] = await Promise.all([
    getJson(`/users/${USER}`), getRepositories(), getPublicCalendar(),
  ]);
  if (profile.login !== USER) throw new Error('Unexpected GitHub account');
  const totals = new Map();
  const owned = repos.filter(repo => !repo.fork && repo.name !== USER);
  for (let start = 0; start < owned.length; start += 4) {
    const results = await Promise.all(owned.slice(start, start + 4).map(repo => getJson(`/repos/${USER}/${encodeURIComponent(repo.name)}/languages`)));
    for (const result of results) {
      for (const [name, bytes] of Object.entries(result)) {
        if (!Number.isFinite(bytes) || bytes < 0) throw new Error('Invalid language byte count');
        if (bytes > 0) totals.set(name, (totals.get(name) || 0) + bytes);
      }
    }
  }
  const languages = [...totals].sort((a, b) => b[1] - a[1]);
  if (!languages.length) throw new Error('Missing public language statistics');
  return {
    user: USER,
    repositories: repos.length,
    languages,
    ...calendar,
    since: new Date(profile.created_at).getUTCFullYear(),
    date: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  const data = process.argv.includes('--cached')
    ? JSON.parse(await readFile(`${ASSETS}/public-metrics.json`, 'utf8'))
    : await fetchData();
  if (data.user !== USER || !Array.isArray(data.days)) throw new Error('Invalid statistics snapshot');
  const files = Object.entries(themes).flatMap(([theme, palette]) => [
    [`header-${theme}.svg`, header()],
    [`stats-${theme}.svg`, statistics(palette, data)],
    [`activity-${theme}.svg`, activity(palette, data)],
    [`highlights-${theme}.svg`, highlights(palette)],
    [`stack-${theme}.svg`, stack(palette)],
  ]);
  files.push(
    ['contact-telegram.svg', button('Написать мне', '#D0FF71', '#112116', '↗')],
    ['contact-projects.svg', button('Кейсы проектов', '#142F58', '#C6DDFF', '▤')],
    ['contact-code.svg', button('Открытый код', '#123740', '#70ECFF', '</>')],
    ['project-landax.svg', projectLabel('LANDAX.AI', 'SAAS / AI / ANALYTICS', '#48DFFF')],
    ['project-avatar.svg', projectLabel('AvatarAI', 'AI VIDEO / PRODUCTION PIPELINE', '#9DB8FF')],
    ['project-miniapps.svg', projectLabel('Telegram Mini Apps', 'CLIPARIUM / KAIRO / CHANNELOOM', '#D0FF71')],
    ['project-dikidi.svg', projectLabel('DIKIDI × YCLIENTS', 'CRM / SYNC / AUTOMATION', '#FFAE83')],
    ['public-metrics.json', JSON.stringify(data, null, 2) + '\n'],
  );
  await mkdir(ASSETS, { recursive: true });
  for (const [name, content] of files) await writeFile(`${ASSETS}/${name}`, content, 'utf8');
  console.log(JSON.stringify({ repositories: data.repositories, languages: data.languages.length, contributions: data.contributions, days: data.days.length, date: data.date, assets: files.length }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}

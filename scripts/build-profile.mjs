import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

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

async function getPublicContributions() {
  // Deliberately unauthenticated: use the same calendar a public visitor sees.
  const response = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { 'User-Agent': `${USER}-profile`, 'Accept-Language': 'en-US,en;q=0.9' },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Public contribution calendar: ${response.status}`);
  const html = await response.text();
  const heading = html.match(/<h2\b[^>]*id="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/i);
  const count = heading?.[1].replace(/<[^>]*>/g, '').match(/([\d,]+)\s+contributions?\b/i);
  if (!count) throw new Error('Contribution calendar markup changed; preserve the last valid images');
  return Number(count[1].replaceAll(',', ''));
}

const palettes = {
  dark: { bg: '#10191D', panel: '#162328', line: '#2B4047', ink: '#F0F6F5', muted: '#A5B7BC', accent: '#80DFC3', soft: '#1C3933', grid: '#1D2C32' },
  light: { bg: '#F1F6F3', panel: '#FFFFFF', line: '#CAD9D2', ink: '#142A25', muted: '#526C63', accent: '#14765F', soft: '#D7EBE2', grid: '#E2EBE6' },
};

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (x, y, value, size, color, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${escape(value)}</text>`;
const rect = (x, y, w, h, fill, stroke = 'none', radius = 8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;

function svg(width, height, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">
<title id="title">${escape(title)}</title>
<g font-family="Segoe UI, Arial, sans-serif">${body}</g>
</svg>\n`;
}

function header(p) {
  let grid = '';
  for (let x = 744; x < 1170; x += 24) {
    for (let y = 80; y < 330; y += 24) grid += `<circle cx="${x}" cy="${y}" r="1" fill="${p.line}"/>`;
  }
  const node = (x, y, label, sub, accent = false) => [
    rect(x, y, 160, 66, accent ? p.soft : p.panel, accent ? p.accent : p.line, 10),
    text(x + 16, y + 27, label, 17, accent ? p.accent : p.ink, 'font-weight="600"'),
    text(x + 16, y + 48, sub, 12, p.muted),
  ].join('');
  return svg(1200, 380, 'Александр Чекулин | Fullstack Developer | SaaS, AI, automation', [
    rect(0, 0, 1200, 380, p.bg, 'none', 18),
    `<path d="M56 81H1144" stroke="${p.line}"/>`,
    text(56, 52, 'AC / ALEXCHEK51', 17, p.accent, 'font-weight="700" letter-spacing="2"'),
    text(1144, 52, 'FULLSTACK · AI · AUTOMATION', 13, p.muted, 'text-anchor="end" letter-spacing="1.8"'),
    text(54, 157, 'Александр Чекулин', 52, p.ink, 'font-weight="700" letter-spacing="-1.8"'),
    text(56, 208, 'Fullstack Developer', 31, p.accent, 'font-weight="500"'),
    text(56, 257, 'SaaS, AI-интеграции и автоматизация.', 23, p.ink),
    text(56, 290, 'От backend и интерфейса до запуска на сервере.', 19, p.muted),
    text(56, 345, 'PYTHON  /  FASTAPI  /  REACT  /  TYPESCRIPT  /  LINUX', 13, p.muted, 'letter-spacing="1.2"'),
    grid,
    `<path d="M934 153H958M774 186V252H794M1038 186V206H854V222M934 255H958" fill="none" stroke="${p.accent}" stroke-width="1.5"/>`,
    `<circle cx="948" cy="153" r="3" fill="${p.accent}"/><circle cx="945" cy="206" r="3" fill="${p.accent}"/><circle cx="946" cy="255" r="3" fill="${p.accent}"/>`,
    node(774, 120, 'Web interface', 'React / JavaScript'),
    node(958, 120, 'API & data', 'FastAPI / PostgreSQL'),
    node(774, 222, 'AI & workers', 'LLM / queues', true),
    node(958, 222, 'Production', 'Linux / Docker', true),
    text(949, 326, 'BUILD · CONNECT · DEPLOY', 12, p.muted, 'text-anchor="middle" letter-spacing="2"'),
  ].join('\n'));
}

function statistics(p, data) {
  const { repositories, languages, contributions, since, date } = data;
  const palette = ['#57BAA0', '#619CD0', '#D8AB68', '#BC8EB5', '#91AB76', '#8393AA'];
  const total = languages.reduce((sum, [, bytes]) => sum + bytes, 0);
  const chartLanguages = languages.length > 5
    ? [...languages.slice(0, 4), ['Прочее', languages.slice(4).reduce((sum, [, bytes]) => sum + bytes, 0)]]
    : languages;
  let position = 40;
  const segments = chartLanguages.map(([, bytes], index) => {
    const width = (bytes / total) * 1120;
    const segment = rect(position, 233, width, 14, palette[index % palette.length], 'none', 0);
    position += width;
    return segment;
  }).join('');
  const shown = chartLanguages;
  const legend = shown.map(([name, bytes], index) => {
    const x = 40 + index * 224;
    const percent = (bytes / total) * 100;
    const share = percent < 0.1 ? '< 0.1%' : `${percent.toFixed(1)}%`;
    return `<circle cx="${x + 5}" cy="279" r="5" fill="${palette[index]}"/>`
      + text(x + 18, 284, name, 15, p.ink)
      + text(x + 18, 310, share, 16, p.muted);
  }).join('');
  const metrics = [
    [repositories, 'публичных репозиториев'],
    [languages.length, 'языков / форматов'],
    [contributions, 'вкладов за 12 месяцев'],
    [since, 'на GitHub с этого года'],
  ].map(([value, label], i) => {
    const x = 40 + i * 288;
    return text(x, 125, value, 42, p.ink, 'font-weight="600" letter-spacing="-1"')
      + text(x, 155, label, 16, p.muted)
      + (i < 3 ? `<path d="M${x + 260} 88V160" stroke="${p.line}"/>` : '');
  }).join('');
  return svg(1200, 355, `Публичная статистика ${USER}: ${repositories} репозиториев, ${contributions} вкладов за 12 месяцев. Данные на ${date}.`, [
    rect(0.5, 0.5, 1199, 354, p.bg, p.line, 16),
    text(40, 43, 'PUBLIC GITHUB / ALEXCHEK51', 15, p.accent, 'font-weight="600" letter-spacing="1.2"'),
    text(1160, 43, date, 14, p.muted, 'text-anchor="end"'),
    metrics,
    `<path d="M40 182H1160" stroke="${p.line}"/>`,
    text(40, 215, 'Языки публичных репозиториев · по объёму файлов', 16, p.muted),
    segments,
    legend,
  ].join('\n'));
}

async function main() {
  const [profile, repos, contributions] = await Promise.all([
    getJson(`/users/${USER}`), getRepositories(), getPublicContributions(),
  ]);
  if (profile.login !== USER) throw new Error('Unexpected GitHub account');
  const totals = new Map();
  const owned = repos.filter(repo => !repo.fork && repo.name !== USER);
  // Small batches avoid overwhelming GitHub while keeping local builds fast.
  for (let start = 0; start < owned.length; start += 4) {
    const results = await Promise.all(owned.slice(start, start + 4).map(repo => getJson(`/repos/${USER}/${encodeURIComponent(repo.name)}/languages`)));
    for (const result of results) {
      for (const [name, bytes] of Object.entries(result)) {
        if (!Number.isFinite(bytes) || bytes < 0) throw new Error('Invalid language byte count');
        totals.set(name, (totals.get(name) || 0) + bytes);
      }
    }
  }
  const languages = [...totals].sort((a, b) => b[1] - a[1]);
  if (!languages.length || !Number.isFinite(contributions)) throw new Error('Incomplete statistics');
  const data = {
    repositories: repos.length,
    languages,
    contributions,
    since: new Date(profile.created_at).getUTCFullYear(),
    date: new Date().toISOString().slice(0, 10),
  };
  // Gather and validate all remote inputs before touching the last valid assets.
  const files = Object.entries(palettes).flatMap(([theme, colors]) => [
    [`header-${theme}.svg`, header(colors)],
    [`stats-${theme}.svg`, statistics(colors, data)],
  ]);
  await mkdir(ASSETS, { recursive: true });
  for (const [name, content] of files) await writeFile(`${ASSETS}/${name}`, content, 'utf8');
  console.log(JSON.stringify({ repositories: data.repositories, languages, contributions, date: data.date }, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

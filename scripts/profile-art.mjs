// Self-contained SVG artwork: no scripts, remote fonts or runtime dependencies.
export const themes = {
  dark: { bg: '#0A1020', panel: '#101C32', line: '#243A57', ink: '#F4F8FF', muted: '#9DB1CE', cyan: '#48DFFF', blue: '#548BFF', lime: '#D0FF71', orange: '#FFAE83' },
  light: { bg: '#F3F7FF', panel: '#FFFFFF', line: '#CBD9EF', ink: '#14284B', muted: '#53698C', cyan: '#087C9F', blue: '#215DE3', lime: '#548416', orange: '#B85221' },
};
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const txt = (x, y, value, size, color, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(value)}</text>`;
const rect = (x, y, width, height, fill, stroke = 'none', r = 14, extra = '') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${r}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const line = (d, color, width = 1, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const circle = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const motionStyle = `<style>
  @keyframes orbit{to{transform:rotate(360deg)}}
  @keyframes breathe{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes appear{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
  .orbit{transform-origin:960px 234px;animation:orbit 24s linear infinite}
  .reverse{animation-direction:reverse;animation-duration:34s}
  .breathe{animation:breathe 4s ease-in-out infinite}
  .intro{animation:appear 700ms cubic-bezier(.23,1,.32,1) both}
  @media(prefers-reduced-motion:reduce){.orbit,.breathe,.intro{animation:none}.moving{display:none}}
</style>`;
const defs = `<defs>
  <linearGradient id="electric" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4388FF"/><stop offset=".6" stop-color="#48DFFF"/><stop offset="1" stop-color="#D0FF71"/></linearGradient>
  <radialGradient id="halo"><stop stop-color="#1665EA" stop-opacity=".42"/><stop offset="1" stop-color="#1665EA" stop-opacity="0"/></radialGradient>
  <linearGradient id="rim"><stop stop-color="#48DFFF"/><stop offset=".56" stop-color="#4B85FF"/><stop offset="1" stop-color="#D0FF71"/></linearGradient>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;

function svg(width, height, title, body, desc = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>${defs}${motionStyle}<g font-family="Segoe UI,Arial,sans-serif">${body}</g></svg>\n`;
}

function particle(path, color, duration = 7, delay = 0) {
  return `<g class="moving"><circle r="4" fill="${color}" filter="url(#glow)"><animateMotion path="${path}" dur="${duration}s" begin="-${delay}s" repeatCount="indefinite"/></circle></g>`;
}

export function header() {
  const p = themes.dark;
  let grid = '';
  for (let x = 710; x < 1195; x += 26) for (let y = 84; y < 410; y += 26) grid += circle(x, y, 1, '#27456B');
  const circuit = [
    ['M710 156H785Q805 156 805 176V197Q805 217 825 217H887', p.cyan, 7, 1],
    ['M1033 217H1094Q1114 217 1114 197V149', p.blue, 8, 2],
    ['M710 319H799Q819 319 819 299V271Q819 251 839 251H887', p.lime, 6, 4],
    ['M1033 251H1061Q1081 251 1081 271V335H1140', p.orange, 9, 5],
  ];
  const tag = (x, y, label, color, w) => rect(x, y, w, 32, '#111F35', '#2B4566', 8) + txt(x + 12, y + 21, label, 13, color, 'font-family="Consolas,monospace" font-weight="600"');
  return svg(1200, 480, 'Александр Чекулин — Fullstack Developer · AI integrations & automation', [
    rect(1, 1, 1198, 478, '#080F1D', '#284265', 22),
    rect(40, 0, 270, 3, 'url(#rim)', 'none', 0),
    circle(966, 228, 270, 'url(#halo)'),
    grid,
    txt(48, 46, 'ALEXCHEK51', 17, p.cyan, 'font-weight="700" letter-spacing="3"'),
    txt(1152, 46, 'SOFTWARE / AI / INFRASTRUCTURE', 13, p.muted, 'text-anchor="end" letter-spacing="1.6"'),
    line('M48 66H1152', '#233653'),
    `<g class="intro">`,
    txt(44, 150, 'АЛЕКСАНДР', 76, '#F4F8FF', 'font-weight="800" letter-spacing="-3"'),
    txt(44, 232, 'ЧЕКУЛИН', 86, 'url(#electric)', 'font-weight="800" letter-spacing="-3"'),
    txt(48, 288, 'FULLSTACK × AI', 34, p.ink, 'font-weight="600" letter-spacing="2"'),
    txt(48, 331, 'Собираю сервисы, которые работают.', 22, '#D0DDFA'),
    txt(48, 362, 'SaaS · AI-интеграции · автоматизация · Linux', 18, p.muted),
    `</g>`,
    `<g opacity=".65">${circle(960, 234, 158, 'none', 'stroke="#25466F"')}${circle(960, 234, 129, 'none', 'stroke="#2D5280" stroke-dasharray="3 10"')}${circle(960, 234, 93, 'none', 'stroke="#295282"')}</g>`,
    `<g class="orbit">${circle(960, 234, 158, 'none', 'stroke="#45CFFF" stroke-width="2" stroke-dasharray="110 883" transform="rotate(-60 960 234)"')}${circle(1118, 234, 5, p.cyan, 'filter="url(#glow)"')}</g>`,
    `<g class="orbit reverse">${circle(960, 234, 129, 'none', 'stroke="#D0FF71" stroke-width="2" stroke-dasharray="64 747"')}${circle(831, 234, 4, p.lime, 'filter="url(#glow)"')}</g>`,
    ...circuit.map(([d, color, duration, delay]) => line(d, '#345879', 1.5) + particle(d, color, duration, delay)),
    rect(889, 164, 142, 140, '#132443', '#5083CE', 22),
    rect(902, 177, 116, 114, '#0B1730', '#2D4B75', 16),
    txt(960, 226, '</>', 37, p.cyan, 'text-anchor="middle" font-family="Consolas,monospace" font-weight="700"'),
    txt(960, 263, 'BUILD', 17, p.ink, 'text-anchor="middle" letter-spacing="5"'),
    tag(712, 124, 'WEB / UI', p.cyan, 104),
    tag(1028, 108, 'API / DATA', p.blue, 128),
    tag(714, 330, 'AI / WORKERS', p.lime, 138),
    tag(1029, 352, 'LINUX / OPS', p.orange, 137),
    line('M48 399H1152', '#233653'),
    txt(48, 440, 'PYTHON', 17, p.cyan, 'font-weight="700" letter-spacing="1"'),
    txt(184, 440, 'FASTAPI', 17, p.lime, 'font-weight="700" letter-spacing="1"'),
    txt(326, 440, 'REACT', 17, p.cyan, 'font-weight="700" letter-spacing="1"'),
    txt(450, 440, 'TYPESCRIPT', 17, p.blue, 'font-weight="700" letter-spacing="1"'),
    txt(1152, 440, 'FROM IDEA TO DEPLOYMENT', 13, p.muted, 'text-anchor="end" letter-spacing="2"'),
  ].join('\n'), 'Движущиеся сигналы связывают web-интерфейс, API, AI-задачи и серверную инфраструктуру. Декоративная схема, не график производительности.');
}

export function highlights(p) {
  const items = [
    ['6', 'языков интерфейса', 'LANDAX.AI', p.cyan],
    ['6–180', 'секунд в AI-ролике', 'AVATARAI', p.blue],
    ['3', 'Telegram Mini Apps', 'CLIPARIUM / KAIRO / CHANNELOOM', p.lime],
    ['142', 'услуги в каталоге', 'ZONT × YCLIENTS', p.orange],
  ];
  return svg(1200, 150, 'Проекты в цифрах: 6 языков LANDAX, видео 6–180 секунд, 3 Mini Apps, 142 услуги ZONT', items.map(([value, label, project, color], i) => {
    const x = i * 304;
    return rect(x + 1, 1, 286, 148, p.panel, p.line, 14)
      + rect(x + 18, 20, 4, 40, color, 'none', 2)
      + txt(x + 36, 61, value, 42, color, 'font-weight="700" letter-spacing="-1"')
      + txt(x + 20, 95, label, 17, p.ink)
      + txt(x + 20, 124, project, project.length > 25 ? 10 : 12, p.muted, 'letter-spacing=".5"');
  }).join(''));
}

function stackIcon(label, x, y, color) {
  if (label === 'React') return `<g transform="translate(${x + 23} ${y + 23})" fill="none" stroke="${color}" stroke-width="2">${[0, 60, 120].map(angle => `<ellipse rx="23" ry="8" transform="rotate(${angle})"/>`).join('')}${circle(0, 0, 4, color, 'stroke="none"')}</g>`;
  if (label === 'PostgreSQL') return `<g transform="translate(${x} ${y})" fill="none" stroke="${color}" stroke-width="2"><ellipse cx="23" cy="9" rx="19" ry="7"/><path d="M4 9V37C4 46 42 46 42 37V9M4 22C4 31 42 31 42 22"/></g>`;
  if (label === 'FastAPI') return `<g transform="translate(${x} ${y})">${circle(23, 23, 23, color)}<path d="M27 6L10 26H21L17 41L36 19H24Z" fill="${themes.dark.bg}"/></g>`;
  if (label === 'Docker') return `<g transform="translate(${x} ${y + 6})" fill="${color}">${[[4, 14], [14, 14], [24, 14], [14, 4], [24, 4], [24, -6]].map(([a, b]) => rect(a, b, 8, 8, color, 'none', 1)).join('')}<path d="M0 25H36L44 19L46 24L38 29C33 43 7 43 0 25Z"/></g>`;
  return rect(x, y, 46, 46, color, 'none', 9) + txt(x + 23, y + 32, label === 'TypeScript' ? 'TS' : 'Py', 27, '#0A1020', 'text-anchor="middle" font-weight="700"');
}

export function stack(p) {
  const items = [['Python', p.lime], ['FastAPI', p.cyan], ['React', p.cyan], ['TypeScript', p.blue], ['PostgreSQL', p.orange], ['Docker', p.blue]];
  return svg(1200, 112, 'Основной стек: Python, FastAPI, React, TypeScript, PostgreSQL, Docker', items.map(([label, color], i) => {
    const x = i * 202;
    return rect(x + 1, 1, 187, 108, p.panel, p.line, 14)
      + stackIcon(label, x + 20, 19, color)
      + txt(x + 20, 91, label, 17, p.ink, 'font-weight="600"');
  }).join(''));
}

export function button(label, fill, color, symbol) {
  return svg(230, 48, label, rect(1, 1, 228, 46, fill, '#304B72', 10)
    + txt(20, 31, symbol, symbol.length > 1 ? 15 : 20, color, 'font-weight="700"')
    + txt(54, 30, label, 16, color, 'font-weight="600"'));
}

export function projectLabel(title, category, color) {
  return svg(580, 100, title, rect(0, 0, 580, 100, '#0D1930', 'none', 12)
    + rect(0, 0, 5, 100, color, 'none', 0)
    + line('M386 15L434 85M420 15L468 85M454 15L502 85M488 15L536 85M522 15L570 85', '#203C61', 1)
    + txt(24, 42, title, 28, color, 'font-weight="700"')
    + txt(24, 72, category, 14, '#B1C5E7', 'letter-spacing="1"'));
}

export function statistics(p, data) {
  const { repositories, languages, contributions, since, date, days } = data;
  const colors = [p.cyan, p.blue, p.lime, p.orange, '#C493EB'];
  const total = languages.reduce((sum, [, bytes]) => sum + bytes, 0);
  const chart = languages.length > 5 ? [...languages.slice(0, 4), ['Прочее', languages.slice(4).reduce((sum, [, bytes]) => sum + bytes, 0)]] : languages;
  const circumference = 2 * Math.PI * 100;
  let offset = 0;
  const rings = chart.map(([, bytes], i) => {
    const length = bytes / total * circumference;
    const result = circle(1010, 212, 100, 'none', `stroke="${colors[i]}" stroke-width="25" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" transform="rotate(-90 1010 212)"`);
    offset += length;
    return result;
  }).join('');
  const legend = chart.map(([name, bytes], i) => {
    const y = 125 + i * 42;
    const value = bytes / total * 100;
    return circle(613, y - 5, 5, colors[i]) + txt(630, y, name, 17, p.ink)
      + txt(845, y, value < .1 ? '< 0.1%' : `${value.toFixed(1)}%`, 15, p.muted, 'text-anchor="end"');
  }).join('');
  const topPercent = (languages[0][1] / total * 100).toFixed(1);
  const metrics = [[repositories, 'публичных репозиториев', p.cyan], [contributions, 'вкладов за 12 месяцев', p.blue], [languages.length, 'языков / форматов в коде', p.lime], [since, 'на GitHub с этого года', p.orange]];
  return svg(1200, 370, `GitHub: ${repositories} репозиториев, ${contributions} вкладов за 12 месяцев; распределение языков`, [
    rect(1, 1, 1198, 368, p.bg, p.line, 18),
    rect(30, 0, 180, 3, 'url(#rim)', 'none', 0),
    txt(36, 42, 'GITHUB / ПУБЛИЧНЫЙ КОД', 18, p.ink, 'font-weight="700"'),
    txt(1164, 42, date, 14, p.muted, 'text-anchor="end"'),
    line('M36 62H1164M576 84V329', p.line),
    ...metrics.map(([value, label, color], i) => {
      const x = 36 + (i % 2) * 270;
      const y = i < 2 ? 137 : 259;
      return txt(x, y, value, 49, color, 'font-weight="700" letter-spacing="-1"') + txt(x, y + 29, label, 15, p.muted);
    }),
    txt(608, 87, 'ЯЗЫКИ / ОБЪЁМ ФАЙЛОВ', 13, p.muted, 'letter-spacing="1.4"'),
    legend,
    rings,
    txt(1010, 210, `${topPercent}%`, 36, p.ink, 'font-weight="700" text-anchor="middle"'),
    txt(1010, 241, languages[0][0], 16, p.muted, 'text-anchor="middle"'),
    txt(36, 338, 'Реальные публичные данные · автообновление по понедельникам', 14, p.muted),
  ].join(''));
}

export function activity(p, data) {
  const { days, contributions, date } = data;
  const first = new Date(days[0].date + 'T00:00:00Z');
  const start = first.getTime() - first.getUTCDay() * 86400000;
  const colors = [p.panel, '#1D5D88', '#258EC1', '#48DFFF', '#D0FF71'];
  const months = new Map();
  const cells = days.map(day => {
    const instant = new Date(day.date + 'T00:00:00Z');
    const column = Math.floor((instant.getTime() - start) / 604800000);
    const row = instant.getUTCDay();
    const monthKey = `${instant.getUTCFullYear()}-${instant.getUTCMonth()}`;
    if (instant.getUTCDate() <= 7 && !months.has(monthKey)) months.set(monthKey, { month: instant.getUTCMonth(), column });
    const fill = day.count ? colors[Math.max(1, day.level)] : p.panel;
    return `<g><title>${day.date}: ${day.count} contributions</title>${rect(64 + column * 20.5, 127 + row * 21, 16, 16, fill, day.count ? fill : p.line, 3)}</g>`;
  }).join('');
  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return svg(1200, 338, `${contributions} публичных вкладов за 12 месяцев — календарь AlexChek51`, [
    rect(1, 1, 1198, 336, p.bg, p.line, 18),
    txt(36, 43, 'CONTRIBUTION MAP', 19, p.ink, 'font-weight="700" letter-spacing="1.2"'),
    txt(1164, 43, `${contributions} вкладов / 12 месяцев`, 16, p.cyan, 'text-anchor="end"'),
    line('M36 65H1164', p.line),
    ...[...months.values()].map(({ month, column }) => txt(64 + column * 20.5, 108, monthNames[month], 13, p.muted)),
    ...[[1, 'Пн'], [3, 'Ср'], [5, 'Пт']].map(([row, label]) => txt(24, 140 + row * 21, label, 11, p.muted)),
    cells,
    txt(36, 309, `Публичный календарь GitHub · ${date}`, 13, p.muted),
    txt(906, 309, 'Меньше', 12, p.muted),
    ...colors.map((color, i) => rect(966 + i * 20, 296, 15, 15, color, p.line, 3)),
    txt(1078, 309, 'Больше', 12, p.muted),
  ].join(''), 'Каждая ячейка — день. Цвет соответствует уровню активности GitHub. Нулевые дни остаются пустыми.');
}

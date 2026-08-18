/* ==========================================================================
   GLOBAL UTILITIES & MATHEMATICAL HELPERS
   ========================================================================== */
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function supExp(exp) {
  const neg = exp < 0 ? "⁻" : "";
  return neg + String(Math.abs(exp)).split("").map((d) => SUP[Number(d)]).join("");
}

function sci(n) {
  const parts = n.toExponential(2).split("e");
  return parts[0].replace(".", ",") + "×10" + supExp(Number(parts[1]));
}

const fmt = (n) => {
  if (!isFinite(n)) return String(n);
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a >= 1e6 || a < 1e-3) return sci(n);
  const s = Math.round(n * 100) / 100;
  return String(s).replace(".", ",");
};

const pct = (v, min, max) => ((v - min) / (max - min)) * 100;
const sign = (n) => (n < 0 ? "− " + fmt(Math.abs(n)) : "+ " + fmt(n));
const halo = (c) => `stroke="#070a13" stroke-width="6" paint-order="stroke" fill="${c}"`;

// Desenha o plano cartesiano padrão de fundo para gráficos
function planeSVG(xmin, xmax, ymin, ymax) {
  const W = 500, H = 500, M = 38;
  const sx = (W - 2 * M) / (xmax - xmin), sy = (H - 2 * M) / (ymax - ymin);
  const X = (x) => M + (x - xmin) * sx;
  const Y = (y) => (H - M) - (y - ymin) * sy;
  let g = "";
  for (let x = Math.ceil(xmin); x <= Math.floor(xmax); x++)
    g += '<line x1="' + X(x).toFixed(2) + '" y1="' + M + '" x2="' + X(x).toFixed(2) + '" y2="' + (H - M) + '" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>';
  for (let y = Math.ceil(ymin); y <= Math.floor(ymax); y++)
    g += '<line x1="' + M + '" y1="' + Y(y).toFixed(2) + '" x2="' + (W - M) + '" y2="' + Y(y).toFixed(2) + '" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>';
  g += '<line x1="' + M + '" y1="' + Y(0).toFixed(2) + '" x2="' + (W - M) + '" y2="' + Y(0).toFixed(2) + '" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>';
  g += '<line x1="' + X(0).toFixed(2) + '" y1="' + M + '" x2="' + X(0).toFixed(2) + '" y2="' + (H - M) + '" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>';
  for (let x = Math.ceil(xmin); x <= Math.floor(xmax); x++) {
    if (x === 0) continue;
    g += '<text x="' + X(x).toFixed(2) + '" y="' + (Y(0) + 15) + '" text-anchor="middle" font-size="9" fill="#64748b" font-weight="600">' + x + "</text>";
  }
  for (let y = Math.ceil(ymin); y <= Math.floor(ymax); y++) {
    if (y === 0) continue;
    g += '<text x="' + (X(0) - 6) + '" y="' + (Y(y) + 3).toFixed(2) + '" text-anchor="end" font-size="9" fill="#64748b" font-weight="600">' + y + "</text>";
  }
  return { g, X, Y };
}

/* ==========================================================================
   DATABASE OF ALL 38 FORMULAS
   ========================================================================== */
const PAGES = {};

// ==========================================================================
// SEÇÃO MATEMÁTICA (19 fórmulas)
// ==========================================================================

PAGES.pythagoras = {
  title: "Teorema de Pitágoras",
  cat: "Matemática",
  desc: "No triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos.",
  fix: "a² + b² = c²",
  color: "var(--color-blue)",
  always: true,
  fields: [
    { key: "a", label: "Cateto A", color: "var(--color-blue)", min: 1, max: 15, step: 0.1, def: 6 },
    { key: "b", label: "Cateto B", color: "var(--color-red)", min: 1, max: 15, step: 0.1, def: 8 },
    { key: "c", label: "Hipotenusa", color: "var(--color-green)", min: 1.4, max: 22, step: 0.1, def: 10 }
  ],
  fieldApply: {
    c: (s, v) => {
      const cur = Math.hypot(s.a, s.b);
      if (cur <= 0) { const t = clamp(v, 1.4, 22) / Math.SQRT2; s.a = t; s.b = t; }
      else { const k = clamp(v, 1.4, 22) / cur; s.a = Math.min(s.a * k, 15); s.b = Math.min(s.b * k, 15); }
    }
  },
  update(s) { s.c = Math.hypot(s.a, s.b); },
  live(s) { return `<span class="a">${fmt(s.a)}²</span> + <span class="b">${fmt(s.b)}²</span> = <span class="c">${fmt(s.c)}²</span> (c = <b>${fmt(s.c)}</b>)`; },
  draw(svg, s) {
    const W = 500, H = 500, PAD = 60;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const scale = (W - 2 * PAD) / 18;
    const ax = PAD + s.a * scale, ay = H - PAD;
    const by = H - PAD - s.b * scale;
    const mx = (ax + PAD) / 2, my = (ay + by) / 2;
    const q = 14;
    svg.innerHTML = `
      <polygon points="${PAD},${H-PAD} ${ax},${ay} ${PAD},${by}" fill="rgba(59,130,246,0.08)"/>
      <line x1="${PAD}" y1="${H-PAD}" x2="${ax}" y2="${ay}" stroke="var(--color-blue)" stroke-width="4.5" stroke-linecap="round" style="filter:drop-shadow(0 0 5px rgba(59,130,246,0.3))"/>
      <line x1="${PAD}" y1="${H-PAD}" x2="${PAD}" y2="${by}" stroke="var(--color-red)" stroke-width="4.5" stroke-linecap="round" style="filter:drop-shadow(0 0 5px rgba(239,68,68,0.3))"/>
      <line x1="${ax}" y1="${ay}" x2="${PAD}" y2="${by}" stroke="var(--color-green)" stroke-width="4.5" stroke-linecap="round" style="filter:drop-shadow(0 0 5px rgba(16,185,129,0.3))"/>
      <polyline points="${PAD},${H-PAD} ${PAD+q},${H-PAD} ${PAD+q},${H-PAD-q} ${PAD},${H-PAD-q}" fill="none" stroke="var(--text-secondary)" stroke-width="2"/>
      <text x="${(PAD + ax)/2}" y="${H-PAD + 22}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>a = ${fmt(s.a)}</text>
      <text x="${PAD - 12}" y="${(H-PAD + by)/2 + 4}" text-anchor="end" font-size="14" font-weight="800" ${halo("var(--color-red)")}>b = ${fmt(s.b)}</text>
      <text x="${mx + 12}" y="${my - 12}" text-anchor="start" font-size="14" font-weight="800" ${halo("var(--color-green)")}>c = ${fmt(s.c)}</text>
    `;
  }
};

PAGES.linear = {
  title: "Função Linear",
  cat: "Matemática",
  desc: "y = ax + b. Deslize o coeficiente angular (a) e o termo linear (b) para ver a reta mudar.",
  fix: "y = ax + b",
  color: "var(--color-red)",
  always: true,
  fields: [
    { key: "a", label: "Coef. angular (a)", color: "var(--color-red)", min: -4, max: 4, step: 0.1, def: 1.5 },
    { key: "b", label: "Termo b", color: "var(--color-blue)", min: -6, max: 6, step: 0.2, def: -1 }
  ],
  live(s) { return `y = <span class="a">${fmt(s.a)}</span>x <span class="b">${sign(s.b)}</span>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const p = planeSVG(-8, 8, -8, 8);
    let xs = [-8, 8];
    const at = (y) => (s.a !== 0 ? (y - s.b) / s.a : null);
    const push = (v) => { if (v !== null && v >= -8 && v <= 8) xs.push(v); };
    push(at(-8)); push(at(8));
    const lo = Math.min(...xs), hi = Math.max(...xs);
    const y0 = s.a * lo + s.b, y1 = s.a * hi + s.b;
    let out = p.g;
    out += `<line x1="${p.X(lo)}" y1="${p.Y(y0)}" x2="${p.X(hi)}" y2="${p.Y(y1)}" stroke="var(--color-red)" stroke-width="4" stroke-linecap="round"/>`;
    if (s.b >= -8 && s.b <= 8) {
      out += `<circle cx="${p.X(0)}" cy="${p.Y(s.b)}" r="6" fill="var(--color-blue)" stroke="#fff" stroke-width="2"/>`;
      out += `<text x="${p.X(0) - 10}" y="${p.Y(s.b) - 10}" text-anchor="end" font-size="12" font-weight="700" ${halo("var(--color-blue)")}>(0, ${fmt(s.b)})</text>`;
    }
    const yx = s.a + s.b;
    if (yx >= -8 && yx <= 8) {
      out += `<circle cx="${p.X(1)}" cy="${p.Y(yx)}" r="6" fill="var(--color-yellow)" stroke="#fff" stroke-width="2"/>`;
      out += `<text x="${p.X(1) + 12}" y="${p.Y(yx) + 4}" text-anchor="start" font-size="12" font-weight="700" ${halo("var(--color-yellow)")}>(1, ${fmt(yx)})</text>`;
    }
    svg.innerHTML = out;
  }
};

PAGES.quadratic = {
  title: "Função Quadrática",
  cat: "Matemática",
  desc: "y = ax² + bx + c. Veja a parábola, o vértice e as raízes mudarem ao vivo.",
  fix: "y = ax² + bx + c",
  color: "var(--color-yellow)",
  always: true,
  fields: [
    { key: "a", label: "Coef. a", color: "var(--color-yellow)", min: -2.5, max: 2.5, step: 0.1, def: 0.8 },
    { key: "b", label: "Coef. b", color: "var(--color-red)", min: -6, max: 6, step: 0.1, def: -2 },
    { key: "c", label: "Coef. c", color: "var(--color-blue)", min: -6, max: 6, step: 0.1, def: -2 }
  ],
  fieldApply: {
    a: (s, v) => { s.a = v === 0 ? 0.1 : v; }
  },
  update(s) { s.delta = s.b * s.b - 4 * s.a * s.c; },
  live(s) {
    let txt = `y = <span class="a">${fmt(s.a)}</span>x² <span class="b">${sign(s.b)}</span>x <span class="c">${sign(s.c)}</span><br>Δ = <b>${fmt(s.delta)}</b>`;
    if (s.delta >= 0) {
      const r1 = (-s.b - Math.sqrt(s.delta)) / (2 * s.a);
      const r2 = (-s.b + Math.sqrt(s.delta)) / (2 * s.a);
      txt += `<br>Raízes: x₁ = <b>${fmt(r1)}</b>, x₂ = <b>${fmt(r2)}</b>`;
    } else txt += "<br>Não possui raízes reais.";
    return txt;
  },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const p = planeSVG(-7, 7, -10, 10);
    let path = "", pen = false;
    const N = 100;
    for (let i = 0; i <= N; i++) {
      const x = -7 + (14 * i) / N;
      const y = s.a * x * x + s.b * x + s.c;
      const ok = y >= -10 && y <= 10;
      if (ok) { path += (pen ? " L" : "M") + p.X(x).toFixed(2) + " " + p.Y(y).toFixed(2); pen = true; }
      else pen = false;
    }
    let out = p.g;
    if (path) out += `<path d="${path}" fill="none" stroke="var(--color-yellow)" stroke-width="4" stroke-linecap="round"/>`;
    const xv = -s.b / (2 * s.a), yv = s.a * xv * xv + s.b * xv + s.c;
    if (xv >= -7 && xv <= 7 && yv >= -10 && yv <= 10) {
      out += `<circle cx="${p.X(xv)}" cy="${p.Y(yv)}" r="6" fill="#fff" stroke="var(--color-yellow)" stroke-width="2.5"/>`;
      out += `<text x="${p.X(xv) + 12}" y="${p.Y(yv) - 8}" font-size="12" font-weight="700" ${halo("var(--color-yellow)")}>Vér. (${fmt(xv)}, ${fmt(yv)})</text>`;
    }
    if (s.delta >= 0) {
      const r1 = (-s.b - Math.sqrt(s.delta)) / (2 * s.a);
      const r2 = (-s.b + Math.sqrt(s.delta)) / (2 * s.a);
      [r1, r2].forEach((r, idx) => {
        if (r >= -7 && r <= 7) {
          out += `<circle cx="${p.X(r)}" cy="${p.Y(0)}" r="6.5" fill="var(--color-green)" stroke="#fff" stroke-width="1.5"/>`;
          out += `<text x="${p.X(r)}" y="${p.Y(0) + (idx === 0 ? -12 : 20)}" text-anchor="middle" font-size="11" font-weight="800" ${halo("var(--color-green)")}>x${idx+1} = ${fmt(r)}</text>`;
        }
      });
    }
    svg.innerHTML = out;
  }
};

PAGES.circle = {
  title: "Área do Círculo",
  cat: "Matemática",
  desc: "Área A = πr² e comprimento da circunferência C = 2πr.",
  fix: "A = πr²  |  C = 2πr",
  color: "var(--color-blue)",
  always: true,
  fields: [
    { key: "r", label: "Raio (r)", color: "var(--color-blue)", min: 0.5, max: 10, step: 0.1, def: 4.5 }
  ],
  update(s) { s.A = Math.PI * s.r * s.r; s.C = 2 * Math.PI * s.r; },
  live(s) { return `Área A = π·<span class="a">${fmt(s.r)}²</span> = <b>${fmt(s.A)}</b> u²<br>Circunferência C = 2π·<span class="a">${fmt(s.r)}</span> = <b>${fmt(s.C)}</b> u`; },
  draw(svg, s) {
    const W = 500, H = 500, cx = 250, cy = 250;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const scale = 200 / 10, rad = s.r * scale;
    svg.innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="${rad}" fill="rgba(59,130,246,0.06)" stroke="var(--color-blue)" stroke-width="4.5" style="filter:drop-shadow(0 0 6px rgba(59,130,246,0.25))"/>
      <line x1="${cx}" y1="${cy}" x2="${cx + rad}" y2="${cy}" stroke="var(--color-yellow)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="5.5" fill="#fff"/>
      <circle cx="${cx + rad}" cy="${cy}" r="5.5" fill="var(--color-yellow)" stroke="#fff" stroke-width="1.5"/>
      <text x="${cx + rad/2}" y="${cy - 12}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-yellow)")}>r = ${fmt(s.r)}</text>
    `;
  }
};

PAGES.triangleArea = {
  title: "Área do Triângulo",
  cat: "Matemática",
  desc: "A área de qualquer triângulo é dada pela metade do produto da base pela altura.",
  fix: "A = (b · h) / 2",
  color: "var(--color-red)",
  always: true,
  fields: [
    { key: "base", label: "Base (b)", color: "var(--color-red)", min: 1, max: 15, step: 0.1, def: 10 },
    { key: "h", label: "Altura (h)", color: "var(--color-blue)", min: 1, max: 15, step: 0.1, def: 8 }
  ],
  update(s) { s.A = (s.base * s.h) / 2; },
  live(s) { return `Área A = (<span class="b">${fmt(s.base)}</span> · <span class="a">${fmt(s.h)}</span>) / 2 = <b>${fmt(s.A)}</b>`; },
  draw(svg, s) {
    const W = 500, H = 500, M = 40;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const sx = (W - 2 * M) / 15, sy = (H - 2 * M) / 15;
    const x0 = M + 20, y0 = H - M - 20;
    const x1 = x0 + s.base * sx;
    const x2 = x0 + (s.base * sx) * 0.45;
    const y2 = y0 - s.h * sy;
    svg.innerHTML = `
      <polygon points="${x0},${y0} ${x1},${y0} ${x2},${y2}" fill="rgba(239,68,68,0.08)" stroke="var(--color-red)" stroke-width="4"/>
      <line x1="${x2}" y1="${y0}" x2="${x2}" y2="${y2}" stroke="var(--color-blue)" stroke-width="2.5" stroke-dasharray="6 4"/>
      <polyline points="${x2},${y0} ${x2+10},${y0} ${x2+10},${y0-10} ${x2},${y0-10}" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"/>
      <text x="${(x0+x1)/2}" y="${y0 + 24}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-red)")}>b = ${fmt(s.base)}</text>
      <text x="${x2 - 10}" y="${(y0+y2)/2}" text-anchor="end" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>h = ${fmt(s.h)}</text>
    `;
  }
};

PAGES.rectangle = {
  title: "Área do Retângulo",
  cat: "Matemática",
  desc: "Cálculo da Área e do Perímetro de um quadrilátero reto com base b e altura h.",
  fix: "A = b · h  |  P = 2(b + h)",
  color: "var(--color-blue)",
  always: true,
  fields: [
    { key: "b", label: "Base (b)", color: "var(--color-blue)", min: 1, max: 15, step: 0.1, def: 11 },
    { key: "h", label: "Altura (h)", color: "var(--color-red)", min: 1, max: 15, step: 0.1, def: 6 }
  ],
  update(s) { s.A = s.b * s.h; s.P = 2 * (s.b + s.h); },
  live(s) { return `Área A = <span class="a">${fmt(s.b)}</span> · <span class="b">${fmt(s.h)}</span> = <b>${fmt(s.A)}</b><br>Perímetro P = 2·(<span class="a">${fmt(s.b)}</span> + <span class="b">${fmt(s.h)}</span>) = <b>${fmt(s.P)}</b>`; },
  draw(svg, s) {
    const W = 500, H = 500, M = 50;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const sw = (W - 2 * M) / 15, sh = (H - 2 * M) / 15;
    const w = s.b * sw, h = s.h * sh;
    const bx = (W - w) / 2, by = (H - h) / 2;
    svg.innerHTML = `
      <rect x="${bx}" y="${by}" width="${w}" height="${h}" fill="rgba(59,130,246,0.06)" stroke="var(--color-blue)" stroke-width="4"/>
      <text x="${bx + w/2}" y="${by + h + 22}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>b = ${fmt(s.b)}</text>
      <text x="${bx - 12}" y="${by + h/2 + 4}" text-anchor="end" font-size="14" font-weight="800" ${halo("var(--color-red)")}>h = ${fmt(s.h)}</text>
    `;
  }
};

PAGES.percent = {
  title: "Porcentagem",
  cat: "Matemática",
  desc: "Cálculo de uma parte correspondente a uma taxa percentual de um valor base.",
  fix: "parte = p% de base",
  color: "var(--color-green)",
  always: true,
  fields: [
    { key: "base", label: "Base", color: "var(--color-blue)", min: 10, max: 1000, step: 10, def: 500 },
    { key: "p", label: "Porcentagem (p)", color: "var(--color-green)", min: 0, max: 100, step: 1, def: 35 }
  ],
  update(s) { s.res = (s.base * s.p) / 100; },
  live(s) { return `<span class="c">${fmt(s.p)}%</span> de <span class="a">${fmt(s.base)}</span> = <b>${fmt(s.res)}</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 300");
    const bw = 400, bx = 50, by = 120, bh = 50;
    const fill = (bw * s.p) / 100;
    svg.innerHTML = `
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="rgba(255,255,255,0.03)" stroke="var(--text-muted)" stroke-width="2"/>
      ${fill > 0 ? `<rect x="${bx}" y="${by}" width="${fill}" height="${bh}" rx="12" fill="var(--color-green)" opacity="0.6"/>` : ""}
      <line x1="${bx + fill}" y1="${by - 10}" x2="${bx + fill}" y2="${by + bh + 10}" stroke="var(--color-green)" stroke-width="2" stroke-dasharray="4 3"/>
      <text x="${bx + bw/2}" y="${by + bh/2 + 6}" text-anchor="middle" font-size="14" font-weight="800" ${halo("#fff")}>${fmt(s.p)}%</text>
      <text x="${bx}" y="${by - 16}" text-anchor="start" font-size="12" fill="var(--text-secondary)">0%</text>
      <text x="${bx + bw}" y="${by - 16}" text-anchor="end" font-size="12" fill="var(--text-secondary)">100% (${fmt(s.base)})</text>
      <text x="${bx + fill}" y="${by + bh + 26}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-green)")}>Parte = ${fmt(s.res)}</text>
    `;
  }
};

PAGES.distance = {
  title: "Distância entre Dois Pontos",
  cat: "Matemática",
  desc: "d = √((x₂ − x₁)² + (y₂ − y₁)²). Mova os dois pontos no plano para medir a distância.",
  fix: "d = √(Δx² + Δy²)",
  color: "var(--color-yellow)",
  always: true,
  fields: [
    { key: "x1", label: "Ponto A (x)", color: "var(--color-blue)", min: -8, max: 8, step: 0.5, def: -3 },
    { key: "y1", label: "Ponto A (y)", color: "var(--color-blue)", min: -8, max: 8, step: 0.5, def: -2 },
    { key: "x2", label: "Ponto B (x)", color: "var(--color-red)", min: -8, max: 8, step: 0.5, def: 4 },
    { key: "y2", label: "Ponto B (y)", color: "var(--color-red)", min: -8, max: 8, step: 0.5, def: 3 }
  ],
  update(s) { s.dx = s.x2 - s.x1; s.dy = s.y2 - s.y1; s.d = Math.hypot(s.dx, s.dy); },
  live(s) { return `Δx = ${fmt(s.dx)} | Δy = ${fmt(s.dy)}<br>Distância d = √(${fmt(s.dx)}² + ${fmt(s.dy)}²) = <b>${fmt(s.d)}</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const p = planeSVG(-9, 9, -9, 9);
    const XA = p.X(s.x1), YA = p.Y(s.y1), XB = p.X(s.x2), YB = p.Y(s.y2);
    svg.innerHTML = p.g + `
      <line x1="${XA}" y1="${YA}" x2="${XB}" y2="${YB}" stroke="var(--color-yellow)" stroke-width="3" stroke-linecap="round"/>
      <line x1="${XA}" y1="${YA}" x2="${XB}" y2="${YA}" stroke="var(--color-green)" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>
      <line x1="${XB}" y1="${YA}" x2="${XB}" y2="${YB}" stroke="var(--color-blue)" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>
      <circle cx="${XA}" cy="${YA}" r="7" fill="var(--color-blue)" stroke="#fff" stroke-width="1.5"/>
      <text x="${XA}" y="${YA - 12}" text-anchor="middle" font-size="12" font-weight="800" ${halo("var(--color-blue)")}>A (${fmt(s.x1)}, ${fmt(s.y1)})</text>
      <circle cx="${XB}" cy="${YB}" r="7" fill="var(--color-red)" stroke="#fff" stroke-width="1.5"/>
      <text x="${XB}" y="${YB - 12}" text-anchor="middle" font-size="12" font-weight="800" ${halo("var(--color-red)")}>B (${fmt(s.x2)}, ${fmt(s.y2)})</text>
      <text x="${(XA + XB)/2}" y="${(YA + YB)/2 - 12}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-yellow)")}>d = ${fmt(s.d)}</text>
    `;
  }
};

PAGES.trig = {
  title: "Seno e Cosseno",
  cat: "Matemática",
  desc: "cos²θ + sen²θ = 1. As coordenadas em um círculo unitário projetam os valores das funções trigonométricas.",
  fix: "cos²θ + sen²θ = 1",
  color: "var(--color-blue)",
  always: true,
  fields: [
    { key: "ang", label: "Ângulo (θ)", color: "var(--color-purple)", min: 1, max: 89, step: 1, def: 30 }
  ],
  update(s) {
    const r = (s.ang * Math.PI) / 180;
    s.sin = Math.sin(r);
    s.cos = Math.cos(r);
  },
  live(s) { return `sen(<span class="d">${fmt(s.ang)}°</span>) = <b>${fmt(s.sin)}</b><br>cos(<span class="d">${fmt(s.ang)}°</span>) = <b>${fmt(s.cos)}</b>`; },
  draw(svg, s) {
    const W = 500, H = 500, ox = 100, oy = 400, L = 280;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const r = (s.ang * Math.PI) / 180;
    const ax = ox + Math.cos(r) * L, ay = oy - Math.sin(r) * L;
    const bx = ox + Math.cos(r) * L, by = oy;
    
    svg.innerHTML = `
      <polygon points="${ox},${oy} ${bx},${by} ${ax},${ay}" fill="rgba(16,185,129,0.06)"/>
      <line x1="${ox}" y1="${oy}" x2="${ax}" y2="${ay}" stroke="var(--color-green)" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="${ox}" y1="${oy}" x2="${bx}" y2="${by}" stroke="var(--color-blue)" stroke-width="4" stroke-linecap="round"/>
      <line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="var(--color-red)" stroke-width="4" stroke-linecap="round"/>
      <path d="M ${ox+45} ${oy} A 45 45 0 0 0 ${(ox + 45*Math.cos(r)).toFixed(2)} ${(oy - 45*Math.sin(r)).toFixed(2)}" fill="none" stroke="var(--color-purple)" stroke-width="3"/>
      <text x="${ox + 60}" y="${oy - 16}" font-size="14" font-weight="800" ${halo("var(--color-purple)")}>θ = ${fmt(s.ang)}°</text>
      <text x="${(ox + bx) / 2}" y="${oy + 22}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-blue)")}>cos θ = ${fmt(s.cos)}</text>
      <text x="${bx + 14}" y="${(ay + by)/2 + 4}" text-anchor="start" font-size="13" font-weight="800" ${halo("var(--color-red)")}>sen θ = ${fmt(s.sin)}</text>
      <text x="${(ox+ax)/2 - 12}" y="${(oy+ay)/2 - 12}" text-anchor="end" font-size="13" font-weight="800" ${halo("var(--color-green)")}>hipotenusa = 1</text>
    `;
  }
};

PAGES.pa = {
  title: "Progressão Aritmética",
  cat: "Matemática",
  desc: "aₙ = a₁ + (n − 1)·r. Veja o distanciamento uniforme entre termos conforme a razão r varia.",
  fix: "a_n = a₁ + (n − 1)·r",
  color: "var(--color-yellow)",
  always: true,
  fields: [
    { key: "a1", label: "Primeiro Termo (a₁)", color: "var(--color-blue)", min: -10, max: 10, step: 0.5, def: 2 },
    { key: "r", label: "Razão (r)", color: "var(--color-red)", min: -4, max: 4, step: 0.5, def: 1.5 },
    { key: "n", label: "Termo Final (n)", color: "var(--color-green)", min: 2, max: 10, step: 1, def: 6 }
  ],
  update(s) { s.an = s.a1 + (s.n - 1) * s.r; s.soma = ((s.a1 + s.an) * s.n) / 2; },
  live(s) { return `Termo a<sub>${fmt(s.n)}</sub> = ${fmt(s.a1)} + (${fmt(s.n)}−1)·${fmt(s.r)} = <b>${fmt(s.an)}</b><br>Soma S<sub>n</sub> = <b>${fmt(s.soma)}</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 400");
    const n = Math.round(s.n);
    const terms = [];
    for (let i = 0; i < n; i++) terms.push(s.a1 + i * s.r);
    const lo = Math.min(...terms, 0) - 2, hi = Math.max(...terms, 0) + 2;
    const X = (v) => 50 + ((v - lo) / (hi - lo)) * 400;
    const Y0 = 220;
    let out = `<line x1="40" y1="${Y0}" x2="460" y2="${Y0}" stroke="var(--text-muted)" stroke-width="2"/>`;
    terms.forEach((v, i) => {
      const x = X(v);
      const c = i === n - 1 ? "var(--color-green)" : i === 0 ? "var(--color-blue)" : "var(--color-yellow)";
      out += `
        <circle cx="${x}" cy="${Y0}" r="7" fill="${c}" stroke="#fff" stroke-width="2"/>
        <text x="${x}" y="${Y0 + 26}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-secondary)">a${i+1}</text>
        <text x="${x}" y="${Y0 - 15}" text-anchor="middle" font-size="13" font-weight="800" ${halo("#fff")}>${fmt(v)}</text>
      `;
    });
    svg.innerHTML = out;
  }
};

PAGES.volume = {
  title: "Volume do Cubo",
  cat: "Matemática",
  desc: "V = a³. Veja a projeção 3D de um cubo crescer em tamanho.",
  fix: "V = a³  |  A = 6a²",
  color: "var(--color-purple)",
  always: true,
  fields: [
    { key: "a", label: "Aresta (a)", color: "var(--color-purple)", min: 1, max: 10, step: 0.5, def: 4 }
  ],
  update(s) { s.V = s.a * s.a * s.a; s.A = 6 * s.a * s.a; },
  live(s) { return `Volume V = <span class="e">${fmt(s.a)}³</span> = <b>${fmt(s.V)}</b> u³<br>Área Total A = 6·<span class="e">${fmt(s.a)}²</span> = <b>${fmt(s.A)}</b> u²`; },
  draw(svg, s) {
    const W = 500, H = 500;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const L = 80 + s.a * 15;
    const d = L * 0.45;
    const cx = 250, cy = 250;
    const t = cy - L/2 + d/2, b = cy + L/2 + d/2;
    const l = cx - L/2 - d/2, r = cx + L/2 - d/2;
    svg.innerHTML = `
      <ellipse cx="${cx}" cy="${b + 10}" rx="${L*0.8}" ry="14" fill="rgba(0,0,0,0.3)"/>
      <polygon points="${l},${t} ${r},${t} ${r+d},${t-d} ${l+d},${t-d}" fill="rgba(139,92,246,0.3)" stroke="var(--color-purple)" stroke-width="3"/>
      <polygon points="${r},${t} ${r+d},${t-d} ${r+d},${b-d} ${r},${b}" fill="rgba(139,92,246,0.15)" stroke="var(--color-purple)" stroke-width="3"/>
      <rect x="${l}" y="${t}" width="${L}" height="${L}" fill="rgba(139,92,246,0.25)" stroke="var(--color-purple)" stroke-width="3"/>
      <text x="${cx - d/2}" y="${b + 32}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-purple)")}>aresta a = ${fmt(s.a)}</text>
    `;
  }
};

PAGES.esfera = {
  title: "Área e Volume da Esfera",
  cat: "Matemática",
  desc: "A = 4πr² e V = ⁴⁄₃πr³. Visualize a curvatura volumétrica e a escala da esfera.",
  fix: "A = 4πr²  |  V = 4πr³/3",
  color: "var(--color-cyan)",
  always: true,
  fields: [
    { key: "r", label: "Raio (r)", color: "var(--color-cyan)", min: 1, max: 10, step: 0.5, def: 4.5 }
  ],
  update(s) { s.A = 4 * Math.PI * s.r * s.r; s.V = (4 / 3) * Math.PI * s.r * s.r * s.r; },
  live(s) { return `Área Superficial A = 4π·<span class="c">${fmt(s.r)}²</span> = <b>${fmt(s.A)}</b> u²<br>Volume V = ⁴⁄₃π·<span class="c">${fmt(s.r)}³</span> = <b>${fmt(s.V)}</b> u³`; },
  draw(svg, s) {
    const W = 500, H = 500, cx = 250, cy = 250;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const r = 50 + s.r * 15;
    const rFlat = r * 0.35;
    svg.innerHTML = `
      <ellipse cx="${cx}" cy="${cy + r + 5}" rx="${r*0.9}" ry="12" fill="rgba(0,0,0,0.3)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(6,182,212,0.06)" stroke="var(--color-cyan)" stroke-width="4.5" style="filter:drop-shadow(0 0 6px rgba(6,182,212,0.25))"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${rFlat}" fill="none" stroke="rgba(6,182,212,0.4)" stroke-width="2" stroke-dasharray="5 5"/>
      <line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="var(--color-yellow)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="4" fill="#fff"/>
      <circle cx="${cx + r}" cy="${cy}" r="4.5" fill="var(--color-yellow)" stroke="#fff" stroke-width="1.5"/>
      <text x="${cx + r/2}" y="${cy - 12}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-yellow)")}>r = ${fmt(s.r)}</text>
    `;
  }
};

PAGES.juros = {
  title: "Juros Compostos",
  cat: "Matemática",
  desc: "M = C·(1+i)ᵗ. O crescimento geométrico do dinheiro acumulado com o passar do tempo.",
  fix: "M = C · (1 + i)ᵗ",
  color: "var(--color-yellow)",
  always: true,
  fields: [
    { key: "C", label: "Capital Inicial (C)", color: "var(--color-blue)", min: 100, max: 10000, step: 100, def: 1000 },
    { key: "i", label: "Taxa Mensal % (i)", color: "var(--color-yellow)", min: 0.2, max: 15, step: 0.1, def: 3.5 },
    { key: "t", label: "Tempo / Meses (t)", color: "var(--color-green)", min: 1, max: 60, step: 1, def: 12 }
  ],
  update(s) { s.M = s.C * Math.pow(1 + s.i / 100, s.t); },
  live(s) { return `Montante M = ${fmt(s.C)}·(1+${fmt(s.i)}%)<sup>${fmt(s.t)}</sup> = <b>R$ ${fmt(s.M)}</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 360");
    const W = 500, H = 360, M = 50;
    const tMax = 60, C = s.C, r_i = s.i / 100, t = clamp(s.t, 1, 60);
    const maxM = C * Math.pow(1 + r_i, tMax);
    const Y = (v) => H - M - (v / maxM) * (H - 2 * M);
    const X = (tt) => M + (tt / tMax) * (W - 2 * M);
    let pts = "";
    for (let tt = 0; tt <= tMax; tt++) pts += X(tt).toFixed(1) + "," + Y(C * Math.pow(1 + r_i, tt)).toFixed(1) + " ";
    const px = X(t), py = Y(C * Math.pow(1 + r_i, t));
    svg.innerHTML = `
      <line x1="${M}" y1="${H-M}" x2="${W-M}" y2="${H-M}" stroke="var(--text-muted)" stroke-width="2"/>
      <line x1="${M}" y1="${M}" x2="${M}" y2="${H-M}" stroke="var(--text-muted)" stroke-width="2"/>
      <polyline points="${pts.trim()}" fill="none" stroke="var(--color-yellow)" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="${px}" cy="${py}" r="7" fill="var(--color-yellow)" stroke="#fff" stroke-width="2"/>
      <text x="${px}" y="${py - 16}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-yellow)")}>R$ ${fmt(s.C * Math.pow(1 + r_i, t))}</text>
      <text x="${W - M}" y="${H - M + 24}" text-anchor="end" font-size="11" fill="var(--text-secondary)">Tempo: ${fmt(s.t)} meses</text>
    `;
  }
};

PAGES.fahrenheit = {
  title: "Celsius para Fahrenheit",
  cat: "Matemática",
  desc: "Conversão direta de temperatura entre as escalas Celsius e Fahrenheit.",
  fix: "°F = °C · 1,8 + 32",
  color: "var(--color-orange)",
  always: true,
  fields: [
    { key: "c", label: "Temperatura (°C)", color: "var(--color-orange)", min: -40, max: 100, step: 1, def: 25 }
  ],
  update(s) { s.f = s.c * 1.8 + 32; },
  live(s) { return `Escala: <b>${fmt(s.c)} °C</b> é igual a <b>${fmt(s.f)} °F</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 440");
    const top = 40, bottom = 320, tubeW = 40;
    const cX = 150, fX = 350;
    const cH = clamp((s.c + 40) / 140, 0, 1) * (bottom - top);
    const fH = clamp((s.f + 40) / 252, 0, 1) * (bottom - top);
    const bulbR = 24;
    svg.innerHTML = `
      <rect x="${cX - tubeW/2}" y="${top}" width="${tubeW}" height="${bottom-top}" rx="${tubeW/2}" fill="none" stroke="var(--text-muted)" stroke-width="2"/>
      <rect x="${cX - tubeW/2}" y="${bottom - cH}" width="${tubeW}" height="${cH}" rx="${tubeW/2}" fill="var(--color-red)" opacity="0.6"/>
      <circle cx="${cX}" cy="${bottom + bulbR - 2}" r="${bulbR}" fill="var(--color-red)" stroke="var(--text-muted)" stroke-width="2"/>
      <text x="${cX}" y="${bottom + bulbR*2 + 26}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-red)")}>${fmt(s.c)} °C</text>

      <rect x="${fX - tubeW/2}" y="${top}" width="${tubeW}" height="${bottom-top}" rx="${tubeW/2}" fill="none" stroke="var(--text-muted)" stroke-width="2"/>
      <rect x="${fX - tubeW/2}" y="${bottom - fH}" width="${tubeW}" height="${fH}" rx="${tubeW/2}" fill="var(--color-orange)" opacity="0.6"/>
      <circle cx="${fX}" cy="${bottom + bulbR - 2}" r="${bulbR}" fill="var(--color-orange)" stroke="var(--text-muted)" stroke-width="2"/>
      <text x="${fX}" y="${bottom + bulbR*2 + 26}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-orange)")}>${fmt(s.f)} °F</text>
    `;
  }
};

PAGES.mediaPonderada = {
  title: "Média Ponderada",
  cat: "Matemática",
  desc: "Média aritmética ponderada onde notas possuem relevâncias (pesos) distintos.",
  fix: "Mp = (v₁p₁ + v₂p₂) / (p₁ + p₂)",
  color: "var(--color-pink)",
  always: true,
  fields: [
    { key: "n1", label: "Nota 1", color: "var(--color-blue)", min: 0, max: 10, step: 0.1, def: 6.5 },
    { key: "n2", label: "Nota 2", color: "var(--color-pink)", min: 0, max: 10, step: 0.1, def: 8.5 },
    { key: "p1", label: "Peso 1", color: "var(--color-pink)", min: 1, max: 5, step: 1, def: 2 },
    { key: "p2", label: "Peso 2", color: "var(--color-pink)", min: 1, max: 5, step: 1, def: 3 }
  ],
  update(s) { s.M = (s.n1 * s.p1 + s.n2 * s.p2) / (s.p1 + s.p2); },
  live(s) { return `Média Mp = (<span class="a">${fmt(s.n1)}</span>·${s.p1} + <span class="e">${fmt(s.n2)}</span>·${s.p2}) / (${s.p1} + ${s.p2}) = <b>${fmt(s.M)}</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 380");
    const baseY = 300, maxH = 200;
    const w1 = 50 + s.p1 * 12, w2 = 50 + s.p2 * 12;
    const x1 = 120 - w1/2, x2 = 380 - w2/2;
    const h1 = (s.n1 / 10) * maxH, h2 = (s.n2 / 10) * maxH;
    const avgH = (s.M / 10) * maxH;
    svg.innerHTML = `
      <rect x="${x1}" y="${baseY - h1}" width="${w1}" height="${h1}" rx="8" fill="rgba(59,130,246,0.3)" stroke="var(--color-blue)" stroke-width="2.5"/>
      <text x="120" y="${baseY - h1 - 10}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>Nota: ${fmt(s.n1)}</text>
      <text x="120" y="${baseY + 22}" text-anchor="middle" font-size="12" fill="var(--text-secondary)">Peso ${s.p1}</text>

      <rect x="${x2}" y="${baseY - h2}" width="${w2}" height="${h2}" rx="8" fill="rgba(236,72,153,0.3)" stroke="var(--color-pink)" stroke-width="2.5"/>
      <text x="380" y="${baseY - h2 - 10}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-pink)")}>Nota: ${fmt(s.n2)}</text>
      <text x="380" y="${baseY + 22}" text-anchor="middle" font-size="12" fill="var(--text-secondary)">Peso ${s.p2}</text>

      <line x1="50" y1="${baseY - avgH}" x2="450" y2="${baseY - avgH}" stroke="var(--color-green)" stroke-width="2.5" stroke-dasharray="6 4"/>
      <text x="250" y="${baseY - avgH - 12}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-green)")}>Média Mp = ${fmt(s.M)}</text>
      <line x1="30" y1="${baseY}" x2="470" y2="${baseY}" stroke="var(--text-muted)" stroke-width="2"/>
    `;
  }
};

// --------------------------------------------------------------------------
// NOVAS FÓRMULAS DE MATEMÁTICA
// --------------------------------------------------------------------------

PAGES.bezier = {
  title: "Curvas de Bézier",
  cat: "Matemática",
  desc: "Interpolação paramétrica utilizada em design gráfico e vetorial. Ajuste o ponto de controle P₁ e veja o traçado no tempo t.",
  fix: "B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂",
  color: "var(--color-purple)",
  always: true,
  fields: [
    { key: "t", label: "Tempo t (fração)", color: "var(--color-purple)", min: 0, max: 1, step: 0.01, def: 0.5 },
    { key: "x1", label: "P₁ - Eixo X", color: "var(--color-blue)", min: -8, max: 8, step: 0.5, def: 2 },
    { key: "y1", label: "P₁ - Eixo Y", color: "var(--color-blue)", min: -8, max: 8, step: 0.5, def: 6 }
  ],
  live(s) {
    const P0 = {x: -7, y: -6}, P2 = {x: 7, y: 5};
    const P1 = {x: s.x1, y: s.y1};
    const bx = (1-s.t)*(1-s.t)*P0.x + 2*(1-s.t)*s.t*P1.x + s.t*s.t*P2.x;
    const by = (1-s.t)*(1-s.t)*P0.y + 2*(1-s.t)*s.t*P1.y + s.t*s.t*P2.y;
    return `P₀ = (-7, -6) | P₂ = (7, 5) | Controle P₁ = (${fmt(s.x1)}, ${fmt(s.y1)})<br>Ponto B(t) no parâmetro t=<b>${fmt(s.t)}</b> é <b>(${fmt(bx)}, ${fmt(by)})</b>`;
  },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const p = planeSVG(-9, 9, -9, 9);
    const P0 = {x: -7, y: -6}, P2 = {x: 7, y: 5};
    const P1 = {x: s.x1, y: s.y1};
    const t = s.t;
    let path = `M ${p.X(P0.x)} ${p.Y(P0.y)}`;
    for (let i = 1; i <= 50; i++) {
      const u = i / 50;
      const cx = (1-u)*(1-u)*P0.x + 2*(1-u)*u*P1.x + u*u*P2.x;
      const cy = (1-u)*(1-u)*P0.y + 2*(1-u)*u*P1.y + u*u*P2.y;
      path += ` L ${p.X(cx).toFixed(1)} ${p.Y(cy).toFixed(1)}`;
    }
    const bx = (1-t)*(1-t)*P0.x + 2*(1-t)*t*P1.x + t*t*P2.x;
    const by = (1-t)*(1-t)*P0.y + 2*(1-t)*t*P1.y + t*t*P2.y;
    const q0x = (1-t)*P0.x + t*P1.x, q0y = (1-t)*P0.y + t*P1.y;
    const q1x = (1-t)*P1.x + t*P2.x, q1y = (1-t)*P1.y + t*P2.y;
    svg.innerHTML = p.g + `
      <path d="${path}" fill="none" stroke="var(--color-purple)" stroke-width="4.5" style="filter:drop-shadow(0 0 5px rgba(139,92,246,0.3))"/>
      <line x1="${p.X(P0.x)}" y1="${p.Y(P0.y)}" x2="${p.X(P1.x)}" y2="${p.Y(P1.y)}" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <line x1="${p.X(P1.x)}" y1="${p.Y(P1.y)}" x2="${p.X(P2.x)}" y2="${p.Y(P2.y)}" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <line x1="${p.X(q0x)}" y1="${p.Y(q0y)}" x2="${p.X(q1x)}" y2="${p.Y(q1y)}" stroke="var(--color-yellow)" stroke-width="1.5"/>
      <circle cx="${p.X(P0.x)}" cy="${p.Y(P0.y)}" r="6" fill="var(--color-blue)" stroke="#fff" stroke-width="1.5"/>
      <circle cx="${p.X(P2.x)}" cy="${p.Y(P2.y)}" r="6" fill="var(--color-blue)" stroke="#fff" stroke-width="1.5"/>
      <circle cx="${p.X(P1.x)}" cy="${p.Y(P1.y)}" r="7" fill="var(--color-red)" stroke="#fff" stroke-width="1.5"/>
      <circle cx="${p.X(bx)}" cy="${p.Y(by)}" r="8" fill="var(--color-purple)" stroke="#fff" stroke-width="2"/>
      <circle cx="${p.X(q0x)}" cy="${p.Y(q0y)}" r="4.5" fill="var(--color-yellow)"/>
      <circle cx="${p.X(q1x)}" cy="${p.Y(q1y)}" r="4.5" fill="var(--color-yellow)"/>
      <text x="${p.X(P0.x)}" y="${p.Y(P0.y) + 20}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--text-secondary)">P₀</text>
      <text x="${p.X(P2.x)}" y="${p.Y(P2.y) - 12}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--text-secondary)">P₂</text>
      <text x="${p.X(P1.x)}" y="${p.Y(P1.y) - 12}" text-anchor="middle" font-size="12" font-weight="800" ${halo("var(--color-red)")}>P₁</text>
      <text x="${p.X(bx) + 12}" y="${p.Y(by) - 12}" text-anchor="start" font-size="12" font-weight="800" ${halo("var(--color-purple)")}>B(t)</text>
    `;
  }
};

PAGES.angleTypes = {
  title: "Tipos de Ângulos",
  cat: "Matemática",
  desc: "Classificação geométrica dos ângulos (agudo, reto, obtuso, raso, côncavo) e dos triângulos correspondentes.",
  fix: "0° ≤ θ ≤ 360°",
  color: "var(--color-yellow)",
  always: true,
  fields: [
    { key: "ang", label: "Ângulo (θ)", color: "var(--color-yellow)", min: 0, max: 360, step: 1, def: 60 }
  ],
  update(s) {
    const ang = s.ang;
    
    let angleType = "Agudo";
    if (ang === 0) angleType = "Nulo";
    else if (ang > 0 && ang < 90) angleType = "Agudo";
    else if (ang === 90) angleType = "Reto";
    else if (ang > 90 && ang < 180) angleType = "Obtuso";
    else if (ang === 180) angleType = "Raso";
    else if (ang > 180 && ang < 360) angleType = "Côncavo";
    else if (ang === 360) angleType = "Completo";
    s.angleType = angleType;

    if (ang > 0 && ang < 180) {
      const c = 130; // AB
      const b = 150; // AC
      const r = (ang * Math.PI) / 180;
      
      const cx = 250 + b * Math.cos(r);
      const cy = 280 - b * Math.sin(r);
      s.cx = cx;
      s.cy = cy;
      
      const a = Math.hypot(380 - cx, 280 - cy); // BC
      
      const cosB = (a*a + c*c - b*b) / (2*a*c);
      const cosC = (a*a + b*b - c*c) / (2*a*b);
      
      const angB = Math.round(Math.acos(clamp(cosB, -1, 1)) * 180 / Math.PI);
      const angC = Math.round(Math.acos(clamp(cosC, -1, 1)) * 180 / Math.PI);
      
      s.angB = angB;
      s.angC = angC;
      
      let triType = "Acutângulo";
      if (ang > 90 || angB > 90 || angC > 90) {
        triType = "Obtusângulo";
      } else if (ang === 90 || angB === 90 || angC === 90) {
        triType = "Retângulo";
      }
      s.triType = triType;
    } else {
      s.cx = 250;
      s.cy = 280;
      s.angB = 0;
      s.angC = 0;
      s.triType = "";
    }
  },
  live(s) {
    let txt = `Ângulo θ = <b>${fmt(s.ang)}°</b> (Ângulo ${s.angleType})`;
    if (s.ang > 0 && s.ang < 180) {
      txt += `<br>Triângulo formado: <b>Triângulo ${s.triType}</b>`;
      txt += `<br>Ângulos internos: A = <b>${fmt(s.ang)}°</b>, B = <b>${fmt(s.angB)}°</b>, C = <b>${fmt(s.angC)}°</b>`;
    } else if (s.ang === 0 || s.ang >= 180) {
      txt += `<br>Não forma triângulo (ângulo nulo, raso ou côncavo).`;
    }
    return txt;
  },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const ang = Math.round(s.ang);
    const r = (ang * Math.PI) / 180;
    
    // Classificação dinâmica baseada no ângulo interpolado s.ang
    let angleType = "Agudo";
    if (ang === 0) angleType = "Nulo";
    else if (ang > 0 && ang < 90) angleType = "Agudo";
    else if (ang === 90) angleType = "Reto";
    else if (ang > 90 && ang < 180) angleType = "Obtuso";
    else if (ang === 180) angleType = "Raso";
    else if (ang > 180 && ang < 360) angleType = "Côncavo";
    else if (ang === 360) angleType = "Completo";

    let triType = "";
    let cx = 250, cy = 280;
    
    if (ang > 0 && ang < 180) {
      const c = 130; // AB
      const b = 150; // AC
      cx = 250 + b * Math.cos(r);
      cy = 280 - b * Math.sin(r);
      
      const a = Math.hypot(380 - cx, 280 - cy); // BC
      
      const cosB = (a*a + c*c - b*b) / (2*a*c);
      const cosC = (a*a + b*b - c*c) / (2*a*b);
      
      const angB = Math.round(Math.acos(clamp(cosB, -1, 1)) * 180 / Math.PI);
      const angC = Math.round(Math.acos(clamp(cosC, -1, 1)) * 180 / Math.PI);
      
      triType = "Acutângulo";
      if (ang > 90 || angB > 90 || angC > 90) {
        triType = "Obtusângulo";
      } else if (ang === 90 || angB === 90 || angC === 90) {
        triType = "Retângulo";
      }
    }
    
    let arcHTML = "";
    if (ang === 90) {
      arcHTML = `
        <polyline points="250,255 275,255 275,280" fill="none" stroke="var(--color-yellow)" stroke-width="2.5"/>
        <circle cx="262.5" cy="267.5" r="2.5" fill="var(--color-yellow)"/>
      `;
    } else if (ang === 360) {
      arcHTML = `<circle cx="250" cy="280" r="30" fill="rgba(245,158,11,0.18)" stroke="var(--color-yellow)" stroke-width="2.5"/>`;
    } else if (ang > 0) {
      arcHTML = `<path d="M 250 280 L 285 280 A 35 35 0 ${ang > 180 ? 1 : 0} 0 ${(250 + 35*Math.cos(r)).toFixed(1)} ${(280 - 35*Math.sin(r)).toFixed(1)} Z" fill="rgba(245,158,11,0.22)" stroke="var(--color-yellow)" stroke-width="2.5"/>`;
    }
    
    let triHTML = "";
    if (ang > 0 && ang < 180) {
      triHTML = `
        <line x1="380" y1="280" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="var(--color-green)" stroke-width="2" stroke-dasharray="5 4" opacity="0.6"/>
        <circle cx="380" cy="280" r="5" fill="var(--color-green)"/>
        <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="var(--color-green)"/>
        <text x="395" y="295" text-anchor="middle" font-size="12" font-weight="700" ${halo("var(--color-green)")}>B</text>
        <text x="${(cx + 10).toFixed(1)}" y="${(cy - 10).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" ${halo("var(--color-green)")}>C</text>
      `;
    }
    
    svg.innerHTML = `
      <rect x="0" y="0" width="500" height="500" fill="rgba(0,0,0,0.15)" rx="24"/>
      <text x="40" y="60" font-size="20" font-weight="800" fill="var(--color-yellow)" font-family="var(--font-title)">Ângulo: ${angleType}</text>
      ${ang > 0 && ang < 180 ? `<text x="460" y="60" text-anchor="end" font-size="20" font-weight="800" fill="var(--color-green)" font-family="var(--font-title)">Triângulo: ${triType}</text>` : ""}
      <line x1="250" y1="280" x2="420" y2="280" stroke="var(--text-primary)" stroke-width="3" stroke-linecap="round"/>
      <line x1="250" y1="280" x2="${(250 + 170*Math.cos(r)).toFixed(1)}" y2="${(280 - 170*Math.sin(r)).toFixed(1)}" stroke="var(--color-yellow)" stroke-width="3" stroke-linecap="round"/>
      ${arcHTML}
      ${triHTML}
      <circle cx="250" cy="280" r="6" fill="var(--color-yellow)" stroke="#fff" stroke-width="1.5"/>
      <text x="232" y="295" font-size="13" font-weight="800" ${halo("var(--color-yellow)")}>A</text>
    `;
  }
};

PAGES.square = {
  title: "Área do Quadrado",
  cat: "Matemática",
  desc: "Cálculo da Área e do Perímetro de um polígono regular de quatro lados de comprimento L.",
  fix: "A = L²  |  P = 4L",
  color: "var(--color-blue)",
  always: true,
  fields: [
    { key: "l", label: "Lado (L)", color: "var(--color-blue)", min: 1, max: 15, step: 0.1, def: 8 }
  ],
  update(s) { s.A = s.l * s.l; s.P = 4 * s.l; },
  live(s) { return `Área A = <span class="a">${fmt(s.l)}</span>² = <b>${fmt(s.A)}</b><br>Perímetro P = 4·<span class="a">${fmt(s.l)}</span> = <b>${fmt(s.P)}</b>`; },
  draw(svg, s) {
    const W = 500, H = 500, M = 50;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const sw = (W - 2 * M) / 15;
    const size = s.l * sw;
    const bx = (W - size) / 2, by = (H - size) / 2;
    svg.innerHTML = `
      <rect x="0" y="0" width="500" height="500" fill="rgba(0,0,0,0.15)" rx="24"/>
      <rect x="${bx}" y="${by}" width="${size}" height="${size}" fill="rgba(59,130,246,0.06)" stroke="var(--color-blue)" stroke-width="4"/>
      <text x="${bx + size/2}" y="${by + size + 22}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>L = ${fmt(s.l)}</text>
      <text x="${bx - 12}" y="${by + size/2 + 4}" text-anchor="end" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>L = ${fmt(s.l)}</text>
    `;
  }
};

PAGES.goldenSpiral = {
  title: "Espiral de Ouro",
  cat: "Matemática",
  desc: "A espiral logarítmica proporcional que se forma traçando quadrantes circulares dentro de retângulos com razões de Fibonacci.",
  fix: "F_n / F_{n-1} ≈ 1,618",
  color: "var(--color-yellow)",
  always: true,
  fields: [
    { key: "n", label: "Nível/Iterações", color: "var(--color-yellow)", min: 1, max: 10, step: 1, def: 6 }
  ],
  live(s) {
    const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
    const n = Math.round(s.n);
    return `Nível n = ${n} | Sequência: <b>${fib.slice(0, n).join(", ")}</b><br>Razão F<sub>n</sub>/F<sub>n-1</sub> = <b>${fmt(fib[n-1]/fib[Math.max(0, n-2)])}</b>`;
  },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
    const n = Math.max(2, Math.round(s.n));
    const sizes = [];
    for (let i = n - 2; i >= 1; i--) sizes.push(fib[i]);
    sizes.push(1);
    const totalW = fib[n - 1], totalH = fib[n - 2];
    let x1 = 0, y1 = 0, x2 = totalW, y2 = totalH;
    const steps = [];
    for (let k = 0; k < sizes.length; k++) {
      const f = sizes[k], d_dir = k % 4;
      let qx = 0, qy = 0;
      if (d_dir === 0) { qx = x1; qy = y1; x1 += f; }
      else if (d_dir === 1) { qx = x1; qy = y1; y1 += f; }
      else if (d_dir === 2) { qx = x2 - f; qy = y1; x2 -= f; }
      else if (d_dir === 3) { qx = x1; qy = y2 - f; y2 -= f; }
      steps.push({ qx, qy, f, dir: d_dir, fibVal: f });
    }
    const marginTop = 65, marginBottom = 35, marginX = 35;
    const W_raw = totalW, H_raw = totalH;
    const scale = Math.min((500 - 2 * marginX) / W_raw, (500 - (marginTop + marginBottom)) / H_raw);
    const offsetX = (500 - W_raw * scale) / 2;
    const offsetY = marginTop + ((500 - (marginTop + marginBottom)) - H_raw * scale) / 2;
    let out = "", path = "";
    const revSteps = [...steps].reverse();
    revSteps.forEach((step, i) => {
      const qx_s = step.qx * scale + offsetX, qy_s = step.qy * scale + offsetY, f_s = step.f * scale, d_dir = step.dir;
      out += `<rect x="${qx_s.toFixed(1)}" y="${qy_s.toFixed(1)}" width="${f_s.toFixed(1)}" height="${f_s.toFixed(1)}" fill="rgba(245,158,11,0.03)" stroke="rgba(245,158,11,0.18)" stroke-width="1.5"/>`;
      out += `<text x="${(qx_s + f_s/2).toFixed(1)}" y="${(qy_s + f_s/2 + 4).toFixed(1)}" text-anchor="middle" font-size="${Math.min(12, Math.max(7, f_s * 0.3)).toFixed(1)}" fill="#64748b" font-weight="600">${step.fibVal}</text>`;
      let startX = 0, startY = 0, destX = 0, destY = 0;
      if (d_dir === 0) { startX = step.qx + step.f; startY = step.qy; destX = step.qx; destY = step.qy + step.f; }
      else if (d_dir === 1) { startX = step.qx + step.f; startY = step.qy + step.f; destX = step.qx; destY = step.qy; }
      else if (d_dir === 2) { startX = step.qx; startY = step.qy + step.f; destX = step.qx + step.f; destY = step.qy; }
      else if (d_dir === 3) { startX = step.qx; startY = step.qy; destX = step.qx + step.f; destY = step.qy + step.f; }
      const startX_s = startX * scale + offsetX, startY_s = startY * scale + offsetY, destX_s = destX * scale + offsetX, destY_s = destY * scale + offsetY;
      if (i === 0) path = `M ${startX_s.toFixed(1)} ${startY_s.toFixed(1)}`;
      path += ` A ${f_s.toFixed(1)} ${f_s.toFixed(1)} 0 0 0 ${destX_s.toFixed(1)} ${destY_s.toFixed(1)}`;
    });
    svg.innerHTML = `
      <rect x="0" y="0" width="500" height="500" fill="rgba(0,0,0,0.15)" rx="24"/>
      <text x="250" y="42" text-anchor="middle" font-size="19" font-weight="800" fill="var(--color-yellow)" font-family="var(--font-title)">a/b = (a + b)/a = φ ≈ 1,618</text>
      ${out}
      ${path ? `<path d="${path}" fill="none" stroke="var(--color-yellow)" stroke-width="3" stroke-linecap="round" style="filter:drop-shadow(0 0 5px rgba(245,158,11,0.45))"/>` : ""}
    `;
  }
};

// ==========================================================================
// SEÇÃO FÍSICA (19 fórmulas)
// ==========================================================================

PAGES.quedaLivre = {
  title: "Queda Livre",
  cat: "Física",
  desc: "A distância percorrida e a velocidade dependem do tempo de queda livre na gravidade local (g).",
  fix: "h = ½gt²  |  v = gt",
  color: "var(--color-red)",
  always: true,
  fields: [
    { key: "t", label: "Tempo de Queda (t)", color: "var(--color-red)", min: 0, max: 5, step: 0.1, def: 2 },
    { key: "g", label: "Gravidade (g)", color: "var(--color-yellow)", min: 1.6, max: 25, step: 0.2, def: 9.8 }
  ],
  update(s) { s.h = 0.5 * s.g * s.t * s.t; s.v = s.g * s.t; },
  live(s) { return `Distância h = ½ · ${fmt(s.g)} · <span class="b">${fmt(s.t)}²</span> = <b>${fmt(s.h)} m</b><br>Velocidade v = ${fmt(s.g)} · <span class="b">${fmt(s.t)}</span> = <b>${fmt(s.v)} m/s</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 480 480");
    const top = 50, bottom = 410, x = 160;
    const maxH = 0.5 * 25 * 25;
    const curH = 0.5 * s.g * s.t * s.t;
    const frac = clamp(curH / maxH, 0, 1);
    const ballY = top + frac * (bottom - top);
    const hMax = 0.5 * s.g * 25;
    const ghostY = top + clamp(s.h / 122.5, 0, 1) * (bottom - top);
    const arrowLen = Math.min(s.v / 50, 1) * 70;
    svg.innerHTML = `
      <line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="5 5"/>
      <line x1="${x - 50}" y1="${bottom}" x2="${x + 50}" y2="${bottom}" stroke="var(--text-primary)" stroke-width="3" stroke-linecap="round"/>
      <text x="${x}" y="${top - 15}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text-secondary)">t = ${fmt(s.t)} s</text>
      ${s.t > 0 ? `<circle cx="${x}" cy="${ghostY}" r="12" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="3 3"/>` : ""}
      <line x1="${x - 8}" y1="${top}" x2="${x - 8}" y2="${ghostY}" stroke="var(--color-blue)" stroke-width="3"/>
      <text x="${x - 18}" y="${(top + ghostY)/2 + 4}" text-anchor="end" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>h = ${fmt(s.h)} m</text>
      ${s.v > 0 ? `
        <line x1="${x + 18}" y1="${ghostY}" x2="${x + 18 + arrowLen}" y2="${ghostY}" stroke="var(--color-yellow)" stroke-width="3.5" stroke-linecap="round"/>
        <polygon points="${x + 18 + arrowLen},${ghostY} ${x + 18 + arrowLen - 8},${ghostY - 5} ${x + 18 + arrowLen - 8},${ghostY + 5}" fill="var(--color-yellow)"/>
        <text x="${x + 24 + arrowLen}" y="${ghostY + 4}" text-anchor="start" font-size="13" font-weight="800" ${halo("var(--color-yellow)")}>v = ${fmt(s.v)} m/s</text>
      ` : ""}
      <circle cx="${x}" cy="${ghostY}" r="11" fill="var(--color-red)" stroke="#fff" stroke-width="2"/>
    `;
  }
};

PAGES.mru = {
  title: "Movimento Uniforme",
  cat: "Física",
  desc: "s = s₀ + v·t. Deslocamento com velocidade constante e sem aceleração, gerando uma reta inclinada.",
  fix: "s = s₀ + v · t",
  color: "var(--color-green)",
  always: true,
  fields: [
    { key: "s0", label: "Posição inicial (s₀)", color: "var(--color-blue)", min: -10, max: 10, step: 0.5, def: 0 },
    { key: "v", label: "Velocidade (v)", color: "var(--color-green)", min: -6, max: 6, step: 0.5, def: 2 },
    { key: "t", label: "Tempo (t)", color: "var(--color-yellow)", min: 0, max: 10, step: 0.5, def: 4 }
  ],
  update(s) { s.s = s.s0 + s.v * s.t; },
  live(s) { return `s(${fmt(s.t)}) = <span class="a">${fmt(s.s0)}</span> + <span class="c">${fmt(s.v)}</span>·<span class="d">${fmt(s.t)}</span> = <b>${fmt(s.s)} m</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const p = planeSVG(0, 10, -12, 12);
    const lo = 0, hi = 10;
    const y0 = s.s0, y1 = s.s0 + s.v * 10;
    let out = p.g;
    out += `<line x1="${p.X(lo)}" y1="${p.Y(y0)}" x2="${p.X(hi)}" y2="${p.Y(y1)}" stroke="var(--color-green)" stroke-width="3.5" stroke-linecap="round"/>`;
    if (s.s0 >= -12 && s.s0 <= 12) {
      out += `<circle cx="${p.X(0)}" cy="${p.Y(s.s0)}" r="5.5" fill="var(--color-blue)" stroke="#fff" stroke-width="1.5"/>`;
      out += `<text x="${p.X(0) + 10}" y="${p.Y(s.s0) - 9}" font-size="12" font-weight="700" ${halo("var(--color-blue)")}>s₀ = ${fmt(s.s0)}</text>`;
    }
    const curPos = s.s0 + s.v * s.t;
    if (curPos >= -12 && curPos <= 12) {
      out += `<circle cx="${p.X(s.t)}" cy="${p.Y(curPos)}" r="7" fill="var(--color-yellow)" stroke="#fff" stroke-width="2"/>`;
      out += `<text x="${p.X(s.t)}" y="${p.Y(curPos) - 15}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-yellow)")}>s(${fmt(s.t)}) = ${fmt(curPos)}</text>`;
    }
    svg.innerHTML = out;
  }
};

PAGES.newton = {
  title: "Segunda Lei de Newton",
  cat: "Física",
  desc: "A força resultante aplicada sobre um corpo é proporcional à sua aceleração e à sua massa.",
  fix: "F = m · a",
  color: "var(--color-red)",
  always: true,
  fields: [
    { key: "m", label: "Massa (m)", color: "var(--color-blue)", min: 1, max: 20, step: 0.5, def: 5 },
    { key: "a_acc", label: "Aceleração (a)", color: "var(--color-red)", min: 0, max: 10, step: 0.2, def: 3 }
  ],
  update(s) { s.F = s.m * s.a_acc; },
  live(s) { return `Força F = <span class="a">${fmt(s.m)} kg</span> · <span class="b">${fmt(s.a_acc)} m/s²</span> = <b>${fmt(s.F)} N</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 360");
    const cy = 180, x0 = 130;
    const len = Math.min(s.F / 200, 1) * 220 + 20;
    svg.innerHTML = `
      <rect x="${x0 - 55}" y="${cy - 40}" width="95" height="75" rx="10" fill="rgba(59,130,246,0.15)" stroke="var(--color-blue)" stroke-width="3"/>
      <text x="${x0 - 7}" y="${cy + 6}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-blue)")}>m = ${fmt(s.m)} kg</text>
      <line x1="${x0 + 40}" y1="${cy}" x2="${x0 + 40 + len}" y2="${cy}" stroke="var(--color-red)" stroke-width="6" stroke-linecap="round"/>
      <polygon points="${x0 + 40 + len},${cy} ${x0 + 40 + len - 14},${cy - 8} ${x0 + 40 + len - 14},${cy + 8}" fill="var(--color-red)"/>
      <text x="${x0 + 40 + len/2}" y="${cy - 16}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-red)")}>F = ${fmt(s.F)} N</text>
      <line x1="${x0 - 80}" y1="${cy + 80}" x2="${x0 + 290}" y2="${cy + 80}" stroke="var(--text-muted)" stroke-width="2"/>
      <text x="${x0 - 7}" y="${cy + 68}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text-secondary)">a = ${fmt(s.a_acc)} m/s²</text>
    `;
  }
};

PAGES.ohm = {
  title: "Lei de Ohm",
  cat: "Física",
  desc: "U = R·I. A tensão elétrica é o produto da resistência do condutor pela corrente que o atravessa.",
  fix: "U = R · I",
  color: "var(--color-green)",
  always: true,
  fields: [
    { key: "U", label: "Tensão (U)", color: "var(--color-cyan)", min: 1, max: 60, step: 1, def: 12 },
    { key: "R", label: "Resistência (R)", color: "var(--color-orange)", min: 1, max: 40, step: 1, def: 6 }
  ],
  update(s) { s.I = s.U / s.R; },
  live(s) { return `Corrente I = <span class="n">${fmt(s.U)} V</span> / <span class="R">${fmt(s.R)} Ω</span> = <b>${fmt(s.I)} A</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 380");
    const t = Date.now() / 1000;
    const x0 = 110, y0 = 120, w = 280, h = 140;
    const zlen = (w - 100) / 6;
    let zz = "";
    for (let i = 0; i < 6; i++) {
      const xx = x0 + 50 + (i + 1) * zlen;
      const yy = y0 - (i % 2 ? 26 : 0);
      zz += (i ? " L" : "M") + xx.toFixed(1) + " " + yy;
    }
    const mid = x0 + w / 2;
    const speed = 0.08 + Math.min(s.I, 10) * 0.35;
    const dots = 6;
    const P = 2 * (w + h);
    const pt = (fr) => {
      let d = (fr * P) % P;
      const segs = [
        [x0, y0, x0 + w, y0],
        [x0 + w, y0, x0 + w, y0 + h],
        [x0 + w, y0 + h, x0, y0 + h],
        [x0, y0 + h, x0, y0]
      ];
      for (const sg of segs) {
        const L = Math.hypot(sg[2] - sg[0], sg[3] - sg[1]);
        if (d <= L) return [sg[0] + (sg[2] - sg[0]) * (d/L), sg[1] + (sg[3] - sg[1]) * (d/L)];
        d -= L;
      }
      return [x0, y0];
    };
    let out = `
      <rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="var(--text-muted)" stroke-width="2.5"/>
      <line x1="${x0}" y1="${y0 + h/2 - 20}" x2="${x0}" y2="${y0 + h/2 + 20}" stroke="var(--color-cyan)" stroke-width="4.5"/>
      <line x1="${x0 - 7}" y1="${y0 + h/2 - 8}" x2="${x0 + 7}" y2="${y0 + h/2 - 8}" stroke="var(--color-cyan)" stroke-width="3"/>
      <line x1="${x0 - 7}" y1="${y0 + h/2 + 8}" x2="${x0 + 7}" y2="${y0 + h/2 + 8}" stroke="var(--color-cyan)" stroke-width="3"/>
      <text x="${x0 - 15}" y="${y0 + h/2 + 5}" text-anchor="end" font-size="14" font-weight="800" ${halo("var(--color-cyan)")}>U = ${fmt(s.U)} V</text>
      <path d="${zz}" fill="none" stroke="var(--color-orange)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${mid}" y="${y0 - 36}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-orange)")}>R = ${fmt(s.R)} Ω</text>
      <line x1="${mid - 30}" y1="${y0 + h/2}" x2="${mid + 30}" y2="${y0 + h/2}" stroke="var(--color-blue)" stroke-width="4" stroke-linecap="round"/>
      <polygon points="${mid + 30},${y0 + h/2} ${mid + 20},${y0 + h/2 - 6} ${mid + 20},${y0 + h/2 + 6}" fill="var(--color-blue)"/>
      <text x="${mid + 36}" y="${y0 + h/2 + 5}" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>I = ${fmt(s.I)} A</text>
    `;
    for (let k = 0; k < dots; k++) {
      const fr = (t * speed + k / dots) % 1;
      const p = pt(fr);
      out += `
        <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="7.5" fill="rgba(245,158,11,0.2)"/>
        <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.5" fill="var(--color-yellow)"/>
      `;
    }
    svg.innerHTML = out;
  }
};

PAGES.cinetica = {
  title: "Energia Cinética",
  cat: "Física",
  desc: "Ec = ½·m·v². A energia que um corpo possui devido ao seu movimento, crescendo quadraticamente com a velocidade.",
  fix: "Ec = ½ · m · v²",
  color: "var(--color-green)",
  always: true,
  fields: [
    { key: "m", label: "Massa (m)", color: "var(--color-blue)", min: 1, max: 20, step: 0.5, def: 5 },
    { key: "v", label: "Velocidade (v)", color: "var(--color-green)", min: 0, max: 30, step: 0.5, def: 12 }
  ],
  update(s) { s.Ec = 0.5 * s.m * s.v * s.v; },
  live(s) { return `Energia Ec = ½ · <span class="a">${fmt(s.m)} kg</span> · <span class="c">${fmt(s.v)} m/s</span>² = <b>${fmt(s.Ec)} J</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 480 360");
    const T = Date.now() / 1000;
    const bw = 300, bh = 40, bx = 90, by = 240;
    const fill = Math.min(s.Ec / 9000, 1);
    const barW = fill * bw;
    const bobX = Math.sin(T * (0.6 + s.v * 0.12)) * (bw/2 - 25);
    svg.innerHTML = `
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="rgba(255,255,255,0.03)" stroke="var(--text-muted)" stroke-width="2.5"/>
      ${barW > 0 ? `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" rx="12" fill="var(--color-green)" opacity="0.6"/>` : ""}
      <circle cx="${bx + bw/2 + bobX}" cy="${by - 60}" r="15" fill="var(--color-red)" stroke="#fff" stroke-width="2"/>
      <line x1="${bx + bw/2 + bobX - 32}" y1="${by - 60}" x2="${bx + bw/2 + bobX - 55}" y2="${by - 60}" stroke="var(--color-pink)" stroke-width="3" stroke-linecap="round"/>
      <line x1="${bx + bw/2 + bobX + 32}" y1="${by - 60}" x2="${bx + bw/2 + bobX + 55}" y2="${by - 60}" stroke="var(--color-pink)" stroke-width="3" stroke-linecap="round"/>
      <text x="${bx + bw/2}" y="${by + bh + 30}" text-anchor="middle" font-size="16" font-weight="800" ${halo("var(--color-green)")}>Ec = ${fmt(s.Ec)} J</text>
      <text x="${bx}" y="${by - 12}" font-size="13" font-weight="700" ${halo("var(--color-blue)")}>m = ${fmt(s.m)} kg</text>
      <text x="${bx + bw}" y="${by - 12}" text-anchor="end" font-size="13" font-weight="700" ${halo("var(--color-green)")}>v = ${fmt(s.v)} m/s</text>
    `;
  }
};

PAGES.epot = {
  title: "Energia Potencial",
  cat: "Física",
  desc: "Ep = m·g·h. Energia mecânica armazenada em função da altura da massa em relação ao solo.",
  fix: "Ep = m · g · h",
  color: "var(--color-yellow)",
  always: true,
  fields: [
    { key: "m", label: "Massa (m)", color: "var(--color-blue)", min: 1, max: 20, step: 0.5, def: 5 },
    { key: "h", label: "Altura (h)", color: "var(--color-red)", min: 0, max: 50, step: 1, def: 15 },
    { key: "g", label: "Gravidade (g)", color: "var(--color-yellow)", min: 1.6, max: 25, step: 0.2, def: 9.8 }
  ],
  update(s) { s.Ep = s.m * s.g * s.h; },
  live(s) { return `Energia Ep = <span class="a">${fmt(s.m)}</span>·${fmt(s.g)}·<span class="b">${fmt(s.h)}</span> = <b>${fmt(s.Ep)} J</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 480 460");
    const ground = 390, x = 200;
    const hFrac = clamp(s.h / 50, 0, 1);
    const topY = ground - hFrac * 300;
    const bw = 80, bh = 36, bx = x - bw/2;
    const shadowW = Math.max(10, 45 - hFrac * 25);
    svg.innerHTML = `
      <line x1="40" y1="${ground}" x2="440" y2="${ground}" stroke="var(--text-primary)" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="${x}" cy="${ground}" rx="${shadowW}" ry="4" fill="rgba(0,0,0,0.35)"/>
      <line x1="${x}" y1="${ground}" x2="${x}" y2="${topY}" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="6 4"/>
      <rect x="${bx}" y="${topY - bh}" width="${bw}" height="${bh}" rx="6" fill="rgba(239,68,68,0.3)" stroke="var(--color-red)" stroke-width="3"/>
      <text x="${x}" y="${(ground + topY)/2 + 4 - bh/2}" text-anchor="end" font-size="14" font-weight="800" ${halo("var(--color-red)")}>h = ${fmt(s.h)} m</text>
      <text x="${x}" y="${topY - bh - 14}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-yellow)")}>Ep = ${fmt(s.Ep)} J</text>
      <text x="${x}" y="${ground + 26}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text-secondary)">m = ${fmt(s.m)} kg</text>
    `;
  }
};

PAGES.work = {
  title: "Trabalho",
  cat: "Física",
  desc: "W = F·d. Energia transferida pela aplicação de uma força constante sobre um determinado deslocamento.",
  fix: "W = F · d",
  color: "var(--color-red)",
  always: true,
  fields: [
    { key: "F", label: "Força (F)", color: "var(--color-blue)", min: 0, max: 100, step: 1, def: 40 },
    { key: "d", label: "Deslocamento (d)", color: "var(--color-red)", min: 0, max: 10, step: 0.5, def: 5 }
  ],
  update(s) { s.W = s.F * s.d; },
  live(s) { return `Trabalho W = <span class="a">${fmt(s.F)} N</span> · <span class="b">${fmt(s.d)} m</span> = <b>${fmt(s.W)} J</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 360");
    const floor = 260, bx = 110, by = floor - 60, w = 85, h = 60;
    const arrowLen = Math.min(s.F / 100, 1) * 160;
    const dist = Math.min(s.d / 10, 1) * 230;
    svg.innerHTML = `
      <line x1="40" y1="${floor}" x2="460" y2="${floor}" stroke="var(--text-muted)" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="${bx + w}" y1="${floor}" x2="${bx + w + dist}" y2="${floor}" stroke="var(--color-yellow)" stroke-width="2.5" stroke-dasharray="6 4"/>
      <line x1="${bx + w}" y1="${floor + 12}" x2="${bx + w + dist}" y2="${floor + 12}" stroke="var(--color-green)" stroke-width="3"/>
      <polygon points="${bx + w + dist},${floor + 12} ${bx + w + dist - 10},${floor + 7} ${bx + w + dist - 10},${floor + 17}" fill="var(--color-green)"/>
      <text x="${bx + w + dist/2}" y="${floor + 30}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-green)")}>d = ${fmt(s.d)} m</text>
      
      <rect x="${bx + dist}" y="${by}" width="${w}" height="${h}" rx="8" fill="rgba(239,68,68,0.25)" stroke="var(--color-red)" stroke-width="3"/>
      <text x="${bx + dist + w/2}" y="${by + h/2 + 5}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-red)")}>m</text>
      
      ${s.F > 0 ? `
        <line x1="${bx + dist + w}" y1="${by + h/2}" x2="${bx + dist + w + arrowLen}" y2="${by + h/2}" stroke="var(--color-blue)" stroke-width="4"/>
        <polygon points="${bx + dist + w + arrowLen},${by + h/2} ${bx + dist + w + arrowLen - 10},${by + h/2 - 6} ${bx + dist + w + arrowLen - 10},${by + h/2 + 6}" fill="var(--color-blue)"/>
        <text x="${bx + dist + w + arrowLen/2}" y="${by + h/2 - 12}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>F = ${fmt(s.F)} N</text>
      ` : ""}
      
      <text x="${bx + w/2}" y="${by - 20}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-yellow)")}>W = ${fmt(s.W)} J</text>
    `;
  }
};

PAGES.pressao = {
  title: "Pressão",
  cat: "Física",
  desc: "P = F/A. Distribuição da intensidade de uma força atuando sobre uma superfície de área A.",
  fix: "P = F / A",
  color: "var(--color-blue)",
  always: true,
  fields: [
    { key: "F", label: "Força (F)", color: "var(--color-blue)", min: 1, max: 100, step: 1, def: 50 },
    { key: "A", label: "Área (A)", color: "var(--color-red)", min: 2, max: 50, step: 1, def: 10 }
  ],
  update(s) { s.P = s.F / s.A; },
  live(s) { return `Pressão P = <span class="a">${fmt(s.F)} N</span> / <span class="b">${fmt(s.A)} m²</span> = <b>${fmt(s.P)} N/m² (Pa)</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 380");
    const cx = 250, top = 90, bottom = 290;
    const w = 50 + (s.A / 50) * 240;
    const arrowLen = Math.min(s.F / 100, 1) * 110 + 30;
    svg.innerHTML = `
      <line x1="40" y1="${bottom}" x2="460" y2="${bottom}" stroke="var(--text-muted)" stroke-width="2"/>
      <rect x="${cx - w/2}" y="${top}" width="${w}" height="${bottom-top}" fill="rgba(59,130,246,0.1)" stroke="var(--color-blue)" stroke-width="3"/>
      
      <line x1="${cx}" y1="${top - 8}" x2="${cx}" y2="${top - arrowLen}" stroke="var(--color-red)" stroke-width="5" stroke-linecap="round"/>
      <polygon points="${cx},${top - 8} ${cx - 10},${top - 20} ${cx + 10},${top - 20}" fill="var(--color-red)"/>
      <text x="${cx}" y="${top - arrowLen - 12}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-red)")}>F = ${fmt(s.F)} N</text>
      
      <text x="${cx}" y="${bottom + 26}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-blue)")}>Área A = ${fmt(s.A)} m²</text>
      <text x="${cx}" y="${(top+bottom)/2 + 5}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-green)")}>P = ${fmt(s.P)} Pa</text>
    `;
  }
};

PAGES.densidade = {
  title: "Densidade",
  cat: "Física",
  desc: "ρ = m/V. Relação de massa contida em um volume de fluido. Se ρ ≤ 1 g/cm³ (água), o bloco flutua.",
  fix: "ρ = m / V",
  color: "var(--color-green)",
  always: true,
  fields: [
    { key: "m", label: "Massa (m)", color: "var(--color-blue)", min: 5, max: 100, step: 1, def: 40 },
    { key: "V", label: "Volume (V)", color: "var(--color-green)", min: 10, max: 100, step: 1, def: 50 }
  ],
  update(s) { s.rho = s.m / s.V; s.floats = s.rho <= 1.0; },
  live(s) { return `Densidade ρ = <span class="a">${fmt(s.m)} g</span> / <span class="c">${fmt(s.V)} cm³</span> = <b>${fmt(s.rho)} g/cm³</b> (${s.floats ? "Flutua" : "Afunda"})`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 480 440");
    const tX = 110, tW = 260, watY = 120, tBot = 370;
    const size = 30 + (s.V / 100) * 60;
    const cx = tX + tW/2;
    const floatY = s.rho <= 1.0 ? watY - size/2 : tBot - size;
    svg.innerHTML = `
      <rect x="${tX}" y="${watY}" width="${tW}" height="${tBot-watY}" fill="rgba(59,130,246,0.18)" stroke="var(--color-blue)" stroke-width="2.5"/>
      <rect x="${tX}" y="${watY}" width="${tW}" height="14" fill="rgba(147,197,253,0.5)"/>
      <text x="${cx}" y="${watY - 14}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text-secondary)">Água (ρ = 1,00)</text>
      
      <rect x="${cx - size/2}" y="${floatY}" width="${size}" height="${size}" rx="6" fill="rgba(239,68,68,0.4)" stroke="var(--color-red)" stroke-width="3"/>
      <text x="${cx}" y="${floatY + size/2 + 5}" text-anchor="middle" font-size="12" font-weight="800" ${halo("var(--color-red)")}>ρ = ${fmt(s.rho)}</text>
      
      <text x="${cx}" y="${tBot + 30}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--text-primary)")}>m = ${fmt(s.m)} g | V = ${fmt(s.V)} cm³</text>
    `;
  }
};

PAGES.gravitacao = {
  title: "Gravitação Universal",
  cat: "Física",
  desc: "F = G·m₁·m₂/d². A força de atração gravitacional recíproca entre duas massas em órbita.",
  fix: "F = G · m₁ · m₂ / d²",
  color: "var(--color-blue)",
  always: true,
  fields: [
    { key: "m1", label: "Massa 1 (m₁)", color: "var(--color-blue)", min: 1, max: 100, step: 1, def: 50 },
    { key: "m2", label: "Massa 2 (m₂)", color: "var(--color-red)", min: 1, max: 100, step: 1, def: 50 },
    { key: "d", label: "Distância (d)", color: "var(--color-yellow)", min: 2, max: 20, step: 1, def: 8 }
  ],
  update(s) { s.F = (6.674e-11 * s.m1 * s.m2) / (s.d * s.d); },
  live(s) { return `Força F = 6,67×10⁻¹¹ · ${fmt(s.m1)} · ${fmt(s.m2)} / ${fmt(s.d)}² = <b>${fmt(s.F)} N</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 360");
    const cy = 180, scale = 220 / 20;
    const r1 = 10 + s.m1 * 0.12, r2 = 10 + s.m2 * 0.12;
    const half = (s.d * scale) / 2;
    const c1x = 250 - half, c2x = 250 + half;
    const fv = Math.min(s.F * 1e11 * 40, 100);
    svg.innerHTML = `
      <circle cx="${c1x}" cy="${cy}" r="${r1}" fill="rgba(59,130,246,0.4)" stroke="var(--color-blue)" stroke-width="2.5"/>
      <text x="${c1x}" y="${cy + r1 + 18}" text-anchor="middle" font-size="11" font-weight="800" ${halo("var(--color-blue)")}>m₁ = ${fmt(s.m1)}</text>
      
      <circle cx="${c2x}" cy="${cy}" r="${r2}" fill="rgba(239,68,68,0.4)" stroke="var(--color-red)" stroke-width="2.5"/>
      <text x="${c2x}" y="${cy + r2 + 18}" text-anchor="middle" font-size="11" font-weight="800" ${halo("var(--color-red)")}>m₂ = ${fmt(s.m2)}</text>
      
      <line x1="${c1x}" y1="${cy}" x2="${c2x}" y2="${cy}" stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4 4"/>
      <text x="250" y="${cy - 12}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-yellow)")}>d = ${fmt(s.d)}</text>
      
      ${fv > 3 ? `
        <line x1="${c1x}" y1="${cy}" x2="${c1x + fv}" y2="${cy}" stroke="var(--color-blue)" stroke-width="3"/>
        <polygon points="${c1x + fv},${cy} ${c1x + fv - 6},${cy - 4} ${c1x + fv - 6},${cy + 4}" fill="var(--color-blue)"/>
        
        <line x1="${c2x}" y1="${cy}" x2="${c2x - fv}" y2="${cy}" stroke="var(--color-red)" stroke-width="3"/>
        <polygon points="${c2x - fv},${cy} ${c2x - fv + 6},${cy - 4} ${c2x - fv + 6},${cy + 4}" fill="var(--color-red)"/>
      ` : ""}
      
      <text x="250" y="${cy + 52}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-green)")}>F = ${fmt(s.F)} N</text>
    `;
  }
};

PAGES.mruv = {
  title: "Movimento Variado",
  cat: "Física",
  desc: "v = v₀ + a·t. A velocidade varia de maneira uniforme no tempo em função da aceleração linear constante.",
  fix: "v = v₀ + a · t",
  color: "var(--color-purple)",
  always: true,
  fields: [
    { key: "v0", label: "Vel. inicial (v₀)", color: "var(--color-blue)", min: 0, max: 30, step: 1, def: 10 },
    { key: "a_acc", label: "Aceleração (a)", color: "var(--color-yellow)", min: -5, max: 5, step: 0.5, def: 2 },
    { key: "t", label: "Tempo (t)", color: "var(--color-green)", min: 0, max: 10, step: 0.5, def: 4 }
  ],
  update(s) { s.v = s.v0 + s.a_acc * s.t; },
  live(s) { return `Velocidade v = ${fmt(s.v0)} + (${fmt(s.a_acc)})·<span class="c">${fmt(s.t)}</span> = <b>${fmt(s.v)} m/s</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const vMin = Math.min(s.v0 + Math.min(0, s.a_acc) * 10, 0) - 2;
    const vMax = Math.max(s.v0 + Math.max(0, s.a_acc) * 10, 5) + 2;
    const pl = planeSVG(0, 10, vMin, vMax);
    const curV = s.v0 + s.a_acc * s.t;
    let out = pl.g;
    out += `<line x1="${pl.X(0)}" y1="${pl.Y(s.v0)}" x2="${pl.X(10)}" y2="${pl.Y(s.v0 + s.a_acc * 10)}" stroke="var(--color-purple)" stroke-width="4" stroke-linecap="round"/>`;
    out += `<circle cx="${pl.X(s.t)}" cy="${pl.Y(curV)}" r="7.5" fill="var(--color-green)" stroke="#fff" stroke-width="2"/>`;
    out += `<text x="${pl.X(s.t)}" y="${pl.Y(curV) - 15}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-green)")}>v(${fmt(s.t)}) = ${fmt(curV)}</text>`;
    svg.innerHTML = out;
  }
};

PAGES.pendulo = {
  title: "Período do Pêndulo",
  cat: "Física",
  desc: "T = 2π√(L/g). O tempo de uma oscilação completa depende da gravidade e do comprimento do fio, não da massa.",
  fix: "T = 2π√(L / g)",
  color: "var(--color-cyan)",
  always: true,
  fields: [
    { key: "L", label: "Comprimento (L)", color: "var(--color-cyan)", min: 0.2, max: 4, step: 0.1, def: 1.5 },
    { key: "g", label: "Gravidade (g)", color: "var(--color-yellow)", min: 1.6, max: 25, step: 0.2, def: 9.8 }
  ],
  update(s) { s.T = 2 * Math.PI * Math.sqrt(s.L / s.g); },
  live(s) { return `Período T = 2π · √(<span class="c">${fmt(s.L)}</span> / ${fmt(s.g)}) = <b>${fmt(s.T)} s</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 420");
    const lPx = 80 + s.L * 65;
    const pX = 250, pY = 50;
    const ang = Math.sin(Date.now() / 320) * 0.7; // Oscilação contínua
    const bx = pX + lPx * Math.sin(ang);
    const by = pY + lPx * Math.cos(ang);
    const r = 12 + Math.min(s.g * 0.35, 12);
    svg.innerHTML = `
      <line x1="${pX - 100}" y1="${pY}" x2="${pX + 100}" y2="${pY}" stroke="var(--text-muted)" stroke-width="3" stroke-linecap="round"/>
      <line x1="${pX}" y1="${pY}" x2="${bx}" y2="${by}" stroke="var(--color-cyan)" stroke-width="2.5"/>
      <circle cx="${pX}" cy="${pY}" r="5.5" fill="#e2e8f0"/>
      <circle cx="${bx}" cy="${by}" r="${r}" fill="rgba(6,182,212,0.4)" stroke="var(--color-cyan)" stroke-width="3"/>
      <text x="${pX}" y="${pY + lPx + 45}" text-anchor="middle" font-size="14" font-weight="800" ${halo("var(--color-cyan)")}>L = ${fmt(s.L)} m</text>
      <text x="${pX}" y="${pY + lPx + 70}" text-anchor="middle" font-size="16" font-weight="800" ${halo("var(--color-green)")}>Período T = ${fmt(s.T)} s</text>
    `;
  }
};

PAGES.calorimetria = {
  title: "Calor Sensível",
  cat: "Física",
  desc: "Q = m·c·ΔT. Energia térmica necessária para alterar a temperatura de uma massa m de calor específico c.",
  fix: "Q = m · c · ΔT",
  color: "var(--color-red)",
  always: true,
  fields: [
    { key: "m", label: "Massa (m)", color: "var(--color-blue)", min: 20, max: 400, step: 10, def: 150 },
    { key: "dT", label: "Variação (ΔT)", color: "var(--color-yellow)", min: 1, max: 80, step: 1, def: 30 }
  ],
  update(s) { s.Q = s.m * 1.0 * s.dT; }, // Calor específico da água = 1
  live(s) { return `Calor Q = <span class="a">${fmt(s.m)} g</span> · 1,0 · <span class="d">${fmt(s.dT)} °C</span> = <b>${fmt(s.Q)} cal</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 480 440");
    const tX = 120, tW = 240, watY = 100, tBot = 320;
    const watH = (s.m / 400) * 140 + 20;
    const wY = tBot - watH;
    const flame = 15 + (s.dT / 80) * 35 + Math.sin(Date.now()/90)*5;
    const cx = 240;
    svg.innerHTML = `
      <rect x="${tX}" y="${watY}" width="${tW}" height="${tBot-watY}" fill="none" stroke="var(--text-muted)" stroke-width="2.5"/>
      <rect x="${tX}" y="${wY}" width="${tW}" height="${watH}" fill="rgba(59,130,246,0.3)" stroke="rgba(59,130,246,0.5)"/>
      <text x="${cx}" y="${wY - 14}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-blue)")}>${fmt(s.m)} g de água</text>
      
      <ellipse cx="${cx}" cy="${tBot + 12}" rx="35" ry="${flame}" fill="rgba(239,68,68,0.55)"/>
      <ellipse cx="${cx}" cy="${tBot + 12}" rx="15" ry="${flame * 0.6}" fill="rgba(245,158,11,0.85)"/>
      
      <text x="${cx}" y="${wY + watH/2 + 5}" text-anchor="middle" font-size="14" font-weight="800" ${halo("#fff")}>ΔT = ${fmt(s.dT)} °C</text>
      <text x="${cx}" y="${tBot + 70}" text-anchor="middle" font-size="16" font-weight="800" ${halo("var(--color-red)")}>Q = ${fmt(s.Q)} cal</text>
    `;
  }
};

PAGES.elastica = {
  title: "Lei de Hooke (Mola)",
  cat: "Física",
  desc: "F = k·x. A força restauradora elástica de uma mola de constante k deforma-se sob deslocamento x.",
  fix: "F = k · x",
  color: "var(--color-green)",
  always: true,
  fields: [
    { key: "k", label: "Constante k (Mola)", color: "var(--color-green)", min: 1, max: 20, step: 1, def: 6 },
    { key: "x", label: "Deformação (x)", color: "var(--color-yellow)", min: 0.5, max: 10, step: 0.5, def: 4 }
  ],
  update(s) { s.F = s.k * s.x; },
  live(s) { return `Força F = <span class="c">${fmt(s.k)} N/m</span> · <span class="d">${fmt(s.x)} m</span> = <b>${fmt(s.F)} N</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 420");
    const wallX = 40, y = 160, len = 100 + s.x * 20;
    const n = 8, seg = len / n, amp = 30;
    const bx = wallX + 10 + len;
    let coil = "";
    for (let i = 0; i < n; i++) {
      const x0 = wallX + 10 + seg * i;
      coil += `
        <line x1="${x0}" y1="${y}" x2="${x0 + seg/2}" y2="${y - amp}" stroke="var(--text-secondary)" stroke-width="3" stroke-linecap="round"/>
        <line x1="${x0 + seg/2}" y1="${y - amp}" x2="${x0 + seg}" y2="${y}" stroke="var(--text-secondary)" stroke-width="3" stroke-linecap="round"/>
      `;
    }
    svg.innerHTML = `
      <rect x="${wallX - 10}" y="80" width="12" height="150" fill="#475569"/>
      <line x1="${wallX}" y1="${y}" x2="${wallX + 10}" y2="${y}" stroke="var(--text-muted)" stroke-width="2"/>
      ${coil}
      <rect x="${bx}" y="${y - 25}" width="70" height="50" rx="8" fill="rgba(34,197,94,0.3)" stroke="var(--color-green)" stroke-width="3"/>
      <text x="${bx + 35}" y="${y + 5}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-green)")}>k = ${fmt(s.k)}</text>
      
      <line x1="${bx}" y1="${y + 50}" x2="${bx + s.x * 12}" y2="${y + 50}" stroke="var(--color-yellow)" stroke-width="3"/>
      <polygon points="${bx + s.x*12},${y+50} ${bx + s.x*12 - 8},${y+45} ${bx + s.x*12 - 8},${y+55}" fill="var(--color-yellow)"/>
      <text x="${bx}" y="${y + 74}" font-size="13" font-weight="800" ${halo("var(--color-yellow)")}>x = ${fmt(s.x)} m</text>
      <text x="${bx + 35}" y="${y - 40}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-green)")}>F = ${fmt(s.F)} N</text>
    `;
  }
};

PAGES.eletrica = {
  title: "Força Elétrica (Coulomb)",
  cat: "Física",
  desc: "F = k·q₁·q₂/d². A magnitude da força eletrostática entre duas cargas elétricas pontuais q₁ e q₂.",
  fix: "F = k · q₁ · q₂ / d²",
  color: "var(--color-orange)",
  always: true,
  fields: [
    { key: "q1", label: "Carga 1 (q₁)", color: "var(--color-blue)", min: 1, max: 10, step: 1, def: 5 },
    { key: "q2", label: "Carga 2 (q₂)", color: "var(--color-red)", min: 1, max: 10, step: 1, def: 6 },
    { key: "d", label: "Distância (d)", color: "var(--color-yellow)", min: 2, max: 20, step: 1, def: 8 }
  ],
  update(s) { s.F = (9e9 * s.q1 * s.q2) / (s.d * s.d); },
  live(s) { return `Força Elétrica F = 9×10⁹ · ${fmt(s.q1)} · ${fmt(s.q2)} / ${fmt(s.d)}² = <b>${fmt(s.F)} N</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 360");
    const cy = 180, scale = 220 / 20, r = 16;
    const half = (s.d * scale) / 2;
    const c1x = 250 - half, c2x = 250 + half;
    const forceLine = Math.min(s.F / 2.5e9, 1) * 70 + 20;
    svg.innerHTML = `
      <circle cx="${c1x}" cy="${cy}" r="${r}" fill="rgba(59,130,246,0.4)" stroke="var(--color-blue)" stroke-width="2.5"/>
      <text x="${c1x}" y="${cy + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">+</text>
      <text x="${c1x}" y="${cy + r + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="var(--text-secondary)">q₁ = ${fmt(s.q1)} C</text>
      
      <circle cx="${c2x}" cy="${cy}" r="${r}" fill="rgba(239,68,68,0.4)" stroke="var(--color-red)" stroke-width="2.5"/>
      <text x="${c2x}" y="${cy + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">+</text>
      <text x="${c2x}" y="${cy + r + 20}" text-anchor="middle" font-size="12" font-weight="800" fill="var(--text-secondary)">q₂ = ${fmt(s.q2)} C</text>
      
      <line x1="${c1x + r}" y1="${cy}" x2="${c2x - r}" y2="${cy}" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="250" y="${cy - 12}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-yellow)")}>d = ${fmt(s.d)} m</text>
      
      <line x1="${c1x - r}" y1="${cy}" x2="${c1x - r - forceLine}" y2="${cy}" stroke="var(--color-blue)" stroke-width="3"/>
      <polygon points="${c1x - r - forceLine},${cy} ${c1x - r - forceLine + 8},${cy - 5} ${c1x - r - forceLine + 8},${cy + 5}" fill="var(--color-blue)"/>
      
      <line x1="${c2x + r}" y1="${cy}" x2="${c2x + r + forceLine}" y2="${cy}" stroke="var(--color-red)" stroke-width="3"/>
      <polygon points="${c2x + r + forceLine},${cy} ${c2x + r + forceLine - 8},${cy - 5} ${c2x + r + forceLine - 8},${cy + 5}" fill="var(--color-red)"/>
      
      <text x="250" y="${cy + 52}" text-anchor="middle" font-size="15" font-weight="800" ${halo("var(--color-green)")}>F = ${fmt(s.F)} N</text>
    `;
  }
};

// --------------------------------------------------------------------------
// NOVAS FÓRMULAS DE FÍSICA
// --------------------------------------------------------------------------

PAGES.projectile = {
  title: "Lançamento de Projéteis",
  cat: "Física",
  desc: "Estudo cinemático de balística bidimensional. O projétil descreve uma trajetória parabólica influenciada pelo ângulo de disparo, velocidade inicial e gravidade.",
  fix: "y = x·tan θ - (g·x²) / (2v₀²cos²θ)",
  color: "var(--color-red)",
  always: true,
  fields: [
    { key: "ang", label: "Ângulo θ (graus)", color: "var(--color-purple)", min: 15, max: 80, step: 1, def: 45 },
    { key: "v0", label: "Vel. Inicial (v₀)", color: "var(--color-blue)", min: 10, max: 40, step: 1, def: 25 },
    { key: "g", label: "Gravidade (g)", color: "var(--color-yellow)", min: 5, max: 20, step: 0.5, def: 9.8 }
  ],
  update(s) {
    const r = (s.ang * Math.PI) / 180;
    // Alcance total: R = v0^2 * sen(2theta) / g
    s.R = (s.v0 * s.v0 * Math.sin(2 * r)) / s.g;
    // Altura máxima: H = v0^2 * sen^2(theta) / (2g)
    s.H = (s.v0 * s.v0 * Math.sin(r) * Math.sin(r)) / (2 * s.g);
  },
  live(s) { return `Alcance Total R = <b>${fmt(s.R)} m</b><br>Altura Máxima H = <b>${fmt(s.H)} m</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const p = planeSVG(0, 160, 0, 160);
    const r = (s.ang * Math.PI) / 180;
    let path = `M ${p.X(0)} ${p.Y(0)}`;
    const xMax = s.R;
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const px = (xMax * i) / steps;
      if (px > 160) break;
      const py = px * Math.tan(r) - (s.g * px * px) / (2 * s.v0 * s.v0 * Math.cos(r) * Math.cos(r));
      if (py < 0) break;
      path += ` L ${p.X(px).toFixed(1)} ${p.Y(py).toFixed(1)}`;
    }
    const t = (Date.now() / 1000) % 2; // Loop de animação local
    const totalT = (2 * s.v0 * Math.sin(r)) / s.g;
    const curT = (t / 2) * totalT;
    const cx = s.v0 * Math.cos(r) * curT;
    const cy = s.v0 * Math.sin(r) * curT - 0.5 * s.g * curT * curT;
    
    let vector = "";
    if (cx <= 160 && cy >= 0) {
      const vx = s.v0 * Math.cos(r);
      const vy = s.v0 * Math.sin(r) - s.g * curT;
      const arrowSc = 1.2;
      vector = `
        <circle cx="${p.X(cx)}" cy="${p.Y(cy)}" r="6.5" fill="var(--color-red)" stroke="#fff" stroke-width="1.5"/>
        <line x1="${p.X(cx)}" y1="${p.Y(cy)}" x2="${p.X(cx + vx * arrowSc)}" y2="${p.Y(cy + vy * arrowSc)}" stroke="var(--color-yellow)" stroke-width="2.5"/>
        <polygon points="${p.X(cx + vx*arrowSc)},${p.Y(cy + vy*arrowSc)} ${p.X(cx + vx*arrowSc) - 6},${p.Y(cy + vy*arrowSc) - 4} ${p.X(cx + vx*arrowSc) - 6},${p.Y(cy + vy*arrowSc) + 4}" fill="var(--color-yellow)" transform="rotate(${-Math.atan2(vy, vx)*180/Math.PI} ${p.X(cx + vx*arrowSc)} ${p.Y(cy + vy*arrowSc)})"/>
      `;
    }
    
    svg.innerHTML = p.g + `
      <path d="${path}" fill="none" stroke="var(--color-blue)" stroke-width="3" stroke-dasharray="4 2"/>
      ${vector}
      <path d="M ${p.X(0)} ${p.Y(0)} L ${p.X(10 * Math.cos(r))} ${p.Y(10 * Math.sin(r))}" stroke="var(--color-purple)" stroke-width="4.5" stroke-linecap="round"/>
      <text x="${p.X(s.R/2)}" y="${p.Y(s.H) - 15}" text-anchor="middle" font-size="12" font-weight="800" ${halo("var(--color-yellow)")}>H_max = ${fmt(s.H)} m</text>
    `;
  }
};

PAGES.orbits = {
  title: "Órbitas Planetárias",
  cat: "Física",
  desc: "As órbitas planetárias elípticas baseadas nas leis da gravitação de Kepler. Veja a variação de velocidade orbital.",
  fix: "v = √(GM · (2/r - 1/a))",
  color: "var(--color-blue)",
  always: true,
  fields: [
    { key: "a_acc", label: "Semieixo Maior (a)", color: "var(--color-blue)", min: 80, max: 150, step: 5, def: 120 },
    { key: "ecc", label: "Excentricidade (e)", color: "var(--color-yellow)", min: 0, max: 0.8, step: 0.05, def: 0.55 }
  ],
  init(s) { this.theta = 0; },
  live(s) {
    const a = s.a_acc;
    const e = s.ecc;
    const rp = a * (1 - e); // Periélio
    const ra = a * (1 + e); // Afélio
    return `Periélio (Aproximação Máxima) = <b>${fmt(rp)} u</b><br>Afélio (Afastamento Máximo) = <b>${fmt(ra)} u</b>`;
  },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 500");
    const cx = 250, cy = 250;
    const a = s.a_acc;
    const e = s.ecc;
    const b = a * Math.sqrt(1 - e * e);
    const f = a * e; // Distância focal ao Sol
    const solX = cx - f;
    
    // Atualiza theta dinamicamente no loop baseado no momento angular
    if (this.theta === undefined) this.theta = 0;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(this.theta));
    const speed = 250 / (r * r); // d_theta/dt proporcional a 1/r^2
    this.theta = (this.theta + speed) % (2 * Math.PI);
    
    const px = solX + r * Math.cos(this.theta);
    const py = cy - r * Math.sin(this.theta);
    
    svg.innerHTML = `
      <rect x="0" y="0" width="500" height="500" fill="rgba(0,0,0,0.15)" rx="24"/>
      <!-- Órbita elíptica -->
      <ellipse cx="${cx}" cy="${cy}" rx="${a}" ry="${b}" fill="none" stroke="rgba(59,130,246,0.3)" stroke-width="2.5"/>
      <!-- Foco (Sol) -->
      <circle cx="${solX}" cy="${cy}" r="16" fill="var(--color-yellow)" style="filter:drop-shadow(0 0 10px rgba(245,158,11,0.7))"/>
      <circle cx="${solX}" cy="${cy}" r="12" fill="#fff"/>
      <!-- Planeta -->
      <circle cx="${px}" cy="${py}" r="7" fill="var(--color-blue)" stroke="#fff" stroke-width="1.5"/>
      <line x1="${solX}" y1="${cy}" x2="${px}" y2="${py}" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
      <text x="${solX}" y="${cy - 24}" text-anchor="middle" font-size="12" font-weight="800" ${halo("var(--color-yellow)")}>Sol</text>
    `;
  }
};

PAGES.timeDilation = {
  title: "Dilatação do Tempo",
  cat: "Física",
  desc: "Consequência direta da relatividade restrita de Einstein: o tempo passa mais devagar para corpos em alta velocidade.",
  fix: "Δt = γ · Δt₀",
  color: "var(--color-cyan)",
  always: true,
  fields: [
    { key: "v_c", label: "Velocidade v/c", color: "var(--color-cyan)", min: 0, max: 0.99, step: 0.01, def: 0.6 }
  ],
  update(s) {
    s.gamma = 1 / Math.sqrt(1 - s.v_c * s.v_c);
  },
  live(s) { return `Fator de Lorentz γ = <b>${fmt(s.gamma)}</b><br>1 segundo na nave equivale a <b>${fmt(s.gamma)} s</b> para quem está de fora.`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 400");
    const t = (Date.now() / 800) % 2; // Loop temporal local para o fóton
    const y0 = 100, y1 = 280, d = y1 - y0;
    const x0 = 100, x1 = 380;
    const gamma = s.gamma;
    const vx = s.v_c * 130;
    
    // Posição vertical do fóton
    const phY = t < 1 ? y0 + t * d : y1 - (t - 1) * d;
    
    // Para o relógio em movimento, o fóton percorre uma trajetória oblíqua
    // Fóton do observador em repouso
    const pRep = `<circle cx="${x0}" cy="${phY}" r="5" fill="var(--color-yellow)"/>`;
    
    // Fóton do observador em movimento
    const dt = t;
    const fMoveX = x1 + (t < 1 ? t * vx : (2 - t) * vx);
    const pMov = `<circle cx="${fMoveX}" cy="${phY}" r="5" fill="var(--color-yellow)"/>`;
    
    svg.innerHTML = `
      <rect x="0" y="0" width="500" height="400" fill="rgba(0,0,0,0.15)" rx="24"/>
      <!-- Relógio em Repouso -->
      <line x1="${x0-20}" y1="${y0}" x2="${x0+20}" y2="${y0}" stroke="var(--text-primary)" stroke-width="2.5"/>
      <line x1="${x0-20}" y1="${y1}" x2="${x0+20}" y2="${y1}" stroke="var(--text-primary)" stroke-width="2.5"/>
      <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
      ${pRep}
      <text x="${x0}" y="${y1 + 24}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-blue)")}>Repouso (γ=1,0)</text>

      <!-- Relógio em Movimento -->
      <line x1="${x1-20}" y1="${y0}" x2="${x1+130}" y2="${y0}" stroke="var(--text-primary)" stroke-width="2.5" stroke-dasharray="100 50"/>
      <line x1="${x1-20}" y1="${y1}" x2="${x1+130}" y2="${y1}" stroke="var(--text-primary)" stroke-width="2.5" stroke-dasharray="100 50"/>
      <path d="M ${x1} ${y0} L ${x1 + vx} ${y1} L ${x1 + 2*vx} ${y0}" fill="none" stroke="rgba(239,68,68,0.15)" stroke-width="2"/>
      ${pMov}
      <text x="${x1 + vx}" y="${y1 + 24}" text-anchor="middle" font-size="13" font-weight="800" ${halo("var(--color-red)")}>Movimento (v=${fmt(s.v_c)}c)</text>
    `;
  }
};

PAGES.idealGas = {
  title: "Gases Ideais",
  cat: "Física",
  desc: "Comportamento macroscópico de um gás em termos de Pressão (P), Volume (V) e Temperatura (T). Moléculas colidindo animadas.",
  fix: "P · V = n · R · T",
  color: "var(--color-yellow)",
  always: true,
  fields: [
    { key: "T", label: "Temperatura (T)", color: "var(--color-yellow)", min: 80, max: 400, step: 10, def: 200 },
    { key: "V", label: "Volume (V)", color: "var(--color-green)", min: 100, max: 250, step: 5, def: 180 }
  ],
  init(s) {
    // Inicializa a lista de moléculas para simulação
    const n = 14;
    this.particles = [];
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x: 60 + Math.random() * 80,
        y: 100 + Math.random() * 150,
        vx: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2),
        vy: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2)
      });
    }
  },
  update(s) {
    s.P = (14 * 8.31 * s.T) / (s.V * 10);
  },
  live(s) { return `Pressão Calculada P = <b>${fmt(s.P)} Pa</b>`; },
  draw(svg, s) {
    svg.setAttribute("viewBox", "0 0 500 400");
    const bx = 50, by = 80, bh = 220;
    const w = s.V; // O volume controla a largura da câmara
    const speedScale = Math.sqrt(s.T / 200) * 0.95; // Velocidade baseada na raiz de T
    
    // Atualiza posições físicas das partículas
    if (!this.particles || this.particles.length === 0) this.init(s);
    let renderParticles = "";
    this.particles.forEach((p) => {
      p.x += p.vx * speedScale;
      p.y += p.vy * speedScale;
      const r = 5.5;
      // Colisões com as paredes da câmara
      if (p.x < bx + r) { p.x = bx + r; p.vx *= -1; }
      if (p.x > bx + w - r) { p.x = bx + w - r; p.vx *= -1; }
      if (p.y < by + r) { p.y = by + r; p.vy *= -1; }
      if (p.y > by + bh - r) { p.y = by + bh - r; p.vy *= -1; }
      
      renderParticles += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="var(--color-blue)" opacity="0.8" stroke="#fff" stroke-width="0.5"/>`;
    });
    
    svg.innerHTML = `
      <rect x="0" y="0" width="500" height="400" fill="rgba(0,0,0,0.15)" rx="24"/>
      <!-- Câmara do Gás -->
      <rect x="${bx}" y="${by}" width="${w}" height="${bh}" fill="rgba(255,255,255,0.02)" stroke="var(--text-muted)" stroke-width="3"/>
      <!-- Pistão Móvel -->
      <rect x="${bx + w - 4}" y="${by - 15}" width="8" height="${bh + 30}" fill="var(--color-green)" stroke="var(--border-hover)" stroke-width="1.5" rx="2"/>
      <line x1="${bx + w}" y1="${by + bh/2}" x2="${bx + w + 45}" y2="${by + bh/2}" stroke="var(--color-green)" stroke-width="4.5"/>
      ${renderParticles}
      <text x="${bx + w/2}" y="${by - 12}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text-secondary)">Volume V = ${s.V} L</text>
      <text x="${bx + w + 55}" y="${by + bh/2 + 5}" font-size="14" font-weight="800" ${halo("var(--color-green)")}>Pistão</text>
      <text x="250" y="${by + bh + 45}" text-anchor="middle" font-size="17" font-weight="800" ${halo("var(--color-yellow)")}>Pressão P = ${fmt(s.P)} Pa</text>
    `;
  }
};

const CATS = [
  { name: "Matemática", ids: ["pythagoras", "linear", "quadratic", "circle", "triangleArea", "rectangle", "percent", "distance", "trig", "pa", "volume", "esfera", "juros", "fahrenheit", "mediaPonderada", "bezier", "angleTypes", "square", "goldenSpiral"] },
  { name: "Física", ids: ["quedaLivre", "mru", "newton", "ohm", "cinetica", "epot", "work", "pressao", "densidade", "gravitacao", "mruv", "pendulo", "calorimetria", "elastica", "eletrica", "projectile", "orbits", "timeDilation", "idealGas"] }
];

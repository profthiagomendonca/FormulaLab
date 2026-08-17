/* ==========================================================================
   INTERACTIVE MAIN APPLICATION CONTROLLER
   ========================================================================== */

const $ = (id) => document.getElementById(id);
const app = $("app");

let current = null;
let state = {};
let disp = {};
let needsDraw = true;
let rafId = null;

// Renders the main category menu
function showMenu() {
  current = null;
  document.body.classList.remove("page-mode");
  
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  let html = `
    <div class="hero">
      <p class="eyebrow">Simulações Científicas</p>
      <h1>Fórmulas Interativas</h1>
      <p class="sub">Explore física e matemática visualmente. Ajuste os parâmetros e veja os efeitos imediatos nos gráficos e nas animações.</p>
    </div>
  `;

  for (const cat of CATS) {
    html += `
      <div class="section">
        <h2>${cat.name}</h2>
        <div class="menu-grid">
    `;
    
    for (const id of cat.ids) {
      const p = PAGES[id];
      if (!p) continue;
      html += `
        <div class="card" style="--accent: ${p.color}" onclick="location.hash='${id}'">
          <h3>${p.title}</h3>
          <div class="fix">${p.fix}</div>
          <p>${p.desc}</p>
        </div>
      `;
    }
    
    html += `
        </div>
      </div>
    `;
  }
  
  app.innerHTML = html;
}

// Renders the interactive simulation page for a given formula ID
function showPage(id) {
  const p = PAGES[id];
  if (!p) {
    showMenu();
    return;
  }
  
  current = p;
  document.body.classList.add("page-mode");
  
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Inicializa o estado dos campos com os valores padrão
  state = {};
  for (const f of p.fields) {
    state[f.key] = f.def;
  }
  
  // Inicialização adicional de estado (para animações, partículas, histórico)
  if (p.init) {
    p.init(state);
  }
  
  if (p.update) {
    p.update(state);
  }
  
  // Variáveis suavizadas de exibição
  disp = {};
  for (const k in state) {
    if (typeof state[k] === "number") {
      disp[k] = state[k];
    }
  }

  // Template HTML da página
  app.innerHTML = `
    <div class="page-head">
      <div class="topline">
        <button class="back" onclick="location.hash=''">← Voltar ao Menu</button>
        <span id="fix">${p.fix}</span>
      </div>
      <h1>${p.title}</h1>
      <p class="sub">${p.desc}</p>
    </div>
    
    <div class="layout">
      <div class="stage">
        <svg id="viz"></svg>
      </div>
      <div class="panel">
        <div id="live" class="live"></div>
        <div id="controls"></div>
      </div>
    </div>
  `;

  const host = $("controls");
  
  // Criação dos painéis de controle para cada parâmetro da fórmula
  for (const f of p.fields) {
    const card = document.createElement("div");
    card.className = "control";
    card.setAttribute("data-side", f.key);
    card.style.setProperty("--accent", f.color);
    
    card.innerHTML = `
      <label><span class="dot"></span>${f.label}</label>
      <output></output>
      <input type="number" min="${f.min}" max="${f.max}" step="${f.step}" inputmode="decimal">
      <input type="range" min="${f.min}" max="${f.max}" step="${f.step}">
    `;
    
    const out = card.querySelector("output");
    const num = card.querySelector("input[type=number]");
    const slider = card.querySelector("input[type=range]");
    
    const apply = (v) => {
      let val = clamp(v, f.min, f.max);
      
      // Permite comportamento customizado ao aplicar valores (como no Teorema de Pitágoras)
      if (p.fieldApply && p.fieldApply[f.key]) {
        p.fieldApply[f.key](state, val);
      } else {
        state[f.key] = val;
      }
      
      if (p.update) {
        p.update(state);
      }
      
      needsDraw = true;
      syncPage();
    };

    // Sincronização dos Sliders e Inputs de Texto
    slider.addEventListener("input", () => apply(Number(slider.value)));
    num.addEventListener("change", () => apply(Number(num.value) || 0));
    
    f._el = { out, num, slider };
    host.appendChild(card);
  }

  syncPage();
  needsDraw = true;
  
  // Ajuste do viewBox no SVG
  const viz = $("viz");
  viz.setAttribute("viewBox", "0 0 500 500");
  p.draw(viz, disp);
  
  // Inicia o ciclo de renderização
  rafId = requestAnimationFrame(loop);
}

// Synchronizes state to HTML inputs
function syncPage() {
  if (!current) return;
  for (const f of current.fields) {
    const v = state[f.key];
    const el = f._el;
    if (el) {
      el.slider.value = v;
      el.num.value = fmt(v);
      el.out.textContent = fmt(v);
      el.slider.style.setProperty("--p", pct(v, f.min, f.max) + "%");
    }
  }
  $("live").innerHTML = current.live(state);
}

// Cycle of drawing using interpolation for smooth transitions
function loop() {
  if (current) {
    let anim = false;
    for (const k in disp) {
      if (Math.abs(state[k] - disp[k]) > 0.005) {
        disp[k] += (state[k] - disp[k]) * 0.28; // Transição suave amortecida
        anim = true;
      } else {
        disp[k] = state[k];
      }
    }
    
    // Se a fórmula precisa de atualização contínua (ex: oscilação do pêndulo ou movimento temporal)
    if (current.always) {
      needsDraw = true;
    }
    
    if (anim || needsDraw) {
      needsDraw = false;
      current.draw($("viz"), disp);
    }
    
    rafId = requestAnimationFrame(loop);
  } else {
    rafId = null;
  }
}

// Router trigger based on location hash
function navigate() {
  const id = location.hash.replace("#", "");
  if (id && PAGES[id]) {
    showPage(id);
  } else {
    showMenu();
  }
}

window.addEventListener("hashchange", navigate);
window.addEventListener("DOMContentLoaded", navigate);

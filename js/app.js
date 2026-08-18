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
let activeCategory = "Matemática";

window.selectCategory = function(name) {
  activeCategory = name;
  const matBtn = $("btn-cat-mat");
  const fisBtn = $("btn-cat-fis");
  if (matBtn && fisBtn) {
    matBtn.classList.toggle("active", name === "Matemática");
    fisBtn.classList.toggle("active", name === "Física");
  }
  const matSec = $("section-Matemática");
  const fisSec = $("section-Física");
  if (matSec && fisSec) {
    matSec.style.display = name === "Matemática" ? "block" : "none";
    fisSec.style.display = name === "Física" ? "block" : "none";
  }
};

window.updateMascot = function(text, expression) {
  const mascotText = $("mascot-text");
  const mascotEyes = $("mascot-eyes");
  if (mascotText) mascotText.innerHTML = text;
  if (mascotEyes) {
    let eyesHTML = "";
    if (expression === "happy") {
      eyesHTML = `
        <path d="M 15 19 Q 19 15 23 19" stroke="var(--color-cyan)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 27 19 Q 31 15 35 19" stroke="var(--color-cyan)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      `;
    } else if (expression === "surprised") {
      eyesHTML = `
        <circle cx="19" cy="20" r="3.5" fill="var(--color-cyan)"/>
        <circle cx="31" cy="20" r="3.5" fill="var(--color-cyan)"/>
      `;
    } else if (expression === "thinking") {
      eyesHTML = `
        <line x1="15" y1="21" x2="23" y2="18" stroke="var(--color-cyan)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="27" y1="18" x2="35" y2="21" stroke="var(--color-cyan)" stroke-width="2.5" stroke-linecap="round"/>
      `;
    } else {
      eyesHTML = `
        <rect x="15" y="19" width="7" height="3.5" rx="1.75" fill="var(--color-cyan)"/>
        <rect x="28" y="19" width="7" height="3.5" rx="1.75" fill="var(--color-cyan)"/>
      `;
    }
    mascotEyes.innerHTML = eyesHTML;
  }
};

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
      
      <div class="category-selector">
        <button id="btn-cat-mat" class="cat-btn ${activeCategory === "Matemática" ? "active" : ""}" onclick="selectCategory('Matemática')">Matemática</button>
        <button id="btn-cat-fis" class="cat-btn ${activeCategory === "Física" ? "active" : ""}" onclick="selectCategory('Física')">Física</button>
      </div>
    </div>
  `;

  for (const cat of CATS) {
    const isVisible = cat.name === activeCategory;
    html += `
      <div id="section-${cat.name}" class="section" style="display: ${isVisible ? 'block' : 'none'}">
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
        
        <div id="mascot-container" class="mascot-box">
          <div class="mascot-avatar">
            <svg viewBox="0 0 50 50" width="50" height="50">
              <!-- Antena -->
              <line x1="25" y1="12" x2="25" y2="4" stroke="var(--color-blue)" stroke-width="2"/>
              <circle cx="25" cy="4" r="3" fill="var(--color-cyan)"/>
              <!-- Orelhas -->
              <rect x="6" y="20" width="4" height="8" rx="2" fill="var(--text-muted)"/>
              <rect x="40" y="20" width="4" height="8" rx="2" fill="var(--text-muted)"/>
              <!-- Cabeça -->
              <rect x="9" y="12" width="32" height="24" rx="8" fill="var(--bg-control)" stroke="var(--border-color)" stroke-width="2"/>
              <!-- Face Plate -->
              <rect x="12" y="15" width="26" height="18" rx="5" fill="#0d1424" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              <!-- Olhos -->
              <g id="mascot-eyes">
                <rect x="15" y="19" width="7" height="3.5" rx="1.75" fill="var(--color-cyan)"/>
                <rect x="28" y="19" width="7" height="3.5" rx="1.75" fill="var(--color-cyan)"/>
              </g>
              <!-- Corpo -->
              <path d="M 18 36 L 15 44 A 3 3 0 0 0 18 47 L 32 47 A 3 3 0 0 0 35 44 L 32 36 Z" fill="var(--bg-control)" stroke="var(--border-color)" stroke-width="2"/>
            </svg>
          </div>
          <div class="mascot-bubble">
            <p id="mascot-text">Olá! Eu sou o Labot. Ajuste os controles acima e veja a mágica acontecer!</p>
          </div>
        </div>
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
  
  // Atualiza as dicas do mascote dinamicamente com base nas interações
  if (current.mascot) {
    const info = current.mascot(state);
    window.updateMascot(info.text, info.expression);
  } else {
    window.updateMascot("Olá! Eu sou o Labot. Ajuste os controles acima e veja a mágica acontecer!", "normal");
  }
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

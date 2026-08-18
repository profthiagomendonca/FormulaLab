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
  showMenu();
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

// Controle do Tema Claro/Escuro com persistência
(function() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }
})();

window.toggleTheme = function() {
  const isLight = document.body.classList.toggle("light-mode");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  updateThemeButtonText();
};

function updateThemeButtonText() {
  const btn = $("theme-toggle-btn");
  if (btn) {
    const isLight = document.body.classList.contains("light-mode");
    btn.innerHTML = isLight ? "☀️ Claro" : "🌙 Escuro";
  }
}

window.activeChallenge = null;

const CHALLENGES = [
  {
    id: "desafio_quadrado",
    title: "Desafio do Quadrado Perfeito",
    desc: "Ajuste o Lado (L) de forma que a área do quadrado seja exatamente igual a 36.0 u.a.!",
    pageId: "square",
    goal: "Ajuste o Lado (L) para que a Área seja exatamente 36.00",
    validate(s) {
      return Math.abs(s.A - 36.00) < 0.01;
    }
  },
  {
    id: "desafio_angulo_reto",
    title: "O Canto Perfeito",
    desc: "Ajuste a abertura do ângulo principal para que as semirretas formem um triângulo retângulo.",
    pageId: "angleTypes",
    goal: "Ajuste o ângulo θ para que o triângulo formado seja Retângulo (um dos ângulos com 90°)",
    validate(s) {
      return s.triType === "Retângulo" && s.ang > 0 && s.ang < 180;
    }
  },
  {
    id: "desafio_queda_terra",
    title: "Gravidade Terrestre",
    desc: "Ajuste a gravidade para a da Terra (9.8 m/s²) e defina o tempo de queda para atingir uma altura final entre 44 e 45 metros.",
    pageId: "quedaLivre",
    goal: "Defina g = 9.8 m/s² e ajuste o tempo t para que a altura h fique entre 44.0m e 45.0m",
    validate(s) {
      return Math.abs(s.g - 9.8) < 0.1 && s.h >= 44 && s.h <= 45;
    }
  }
];

window.startChallenge = function(id) {
  const challenge = CHALLENGES.find(c => c.id === id);
  if (challenge) {
    window.activeChallenge = challenge;
    location.hash = challenge.pageId;
  }
};

// Renders the main category menu
function showMenu() {
  current = null;
  window.activeChallenge = null; // Reseta desafio ativo ao voltar ao menu
  document.body.classList.remove("page-mode");
  
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  let html = `
    <button id="theme-toggle-btn" class="theme-btn" onclick="toggleTheme()">
      ${document.body.classList.contains("light-mode") ? "☀️ Claro" : "🌙 Escuro"}
    </button>
    <div class="hero">
      <p class="eyebrow">Simulações Científicas</p>
      <h1>Fórmulas Interativas</h1>
      <p class="sub">Explore física e matemática visualmente. Ajuste os parâmetros e veja os efeitos imediatos nos gráficos e nas animações.</p>
      
      <div class="category-selector">
        <button id="btn-cat-mat" class="cat-btn ${activeCategory === "Matemática" ? "active" : ""}" onclick="selectCategory('Matemática')">Matemática</button>
        <button id="btn-cat-fis" class="cat-btn ${activeCategory === "Física" ? "active" : ""}" onclick="selectCategory('Física')">Física</button>
        <button id="btn-cat-des" class="cat-btn ${activeCategory === "Desafios" ? "active" : ""}" onclick="selectCategory('Desafios')">Desafios</button>
      </div>
    </div>
  `;

  if (activeCategory === "Desafios") {
    html += `
      <div id="section-Desafios" class="section">
        <h2>Desafios Disponíveis</h2>
        <div class="menu-grid">
    `;
    for (const ch of CHALLENGES) {
      html += `
        <div class="card challenge-card" style="--accent: var(--color-purple)" onclick="startChallenge('${ch.id}')">
          <span class="badge">DESAFIO</span>
          <h3>${ch.title}</h3>
          <p>${ch.desc}</p>
          <div class="challenge-footer">Acesse o laboratório →</div>
        </div>
      `;
    }
    html += `
        </div>
      </div>
    `;
  } else {
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
    <button id="theme-toggle-btn" class="theme-btn" onclick="toggleTheme()">
      ${document.body.classList.contains("light-mode") ? "☀️ Claro" : "🌙 Escuro"}
    </button>
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
        ${window.activeChallenge ? `
          <div class="challenge-banner">
            <strong>🏆 DESAFIO:</strong> ${window.activeChallenge.goal}
          </div>
        ` : ""}
        <div id="live" class="live"></div>
        <div id="controls"></div>
        
        <div id="mascot-container" class="mascot-box">
          <div class="mascot-avatar">
            <svg viewBox="0 0 50 50" width="55" height="55" style="overflow: visible;">
              <!-- Cabelo do Einstein -->
              <!-- Lateral Esquerdo -->
              <path d="M 9 15 C 3 13, 0 18, 3 24 C 0 28, 4 32, 9 29" fill="#f8fafc" stroke="var(--border-color)" stroke-width="1.5"/>
              <!-- Lateral Direito -->
              <path d="M 41 15 C 47 13, 50 18, 47 24 C 50 28, 46 32, 41 29" fill="#f8fafc" stroke="var(--border-color)" stroke-width="1.5"/>
              <!-- Superior -->
              <path d="M 15 13 C 12 7, 20 4, 23 9 C 26 4, 35 6, 35 13" fill="#f8fafc" stroke="var(--border-color)" stroke-width="1.5"/>
              <!-- Antena de Cientista -->
              <line x1="25" y1="9" x2="25" y2="3" stroke="var(--color-blue)" stroke-width="1.5"/>
              <circle cx="25" cy="3" r="2.5" fill="var(--color-cyan)"/>
              <!-- Orelhas -->
              <rect x="5" y="20" width="4" height="8" rx="2" fill="var(--text-muted)"/>
              <rect x="41" y="20" width="4" height="8" rx="2" fill="var(--text-muted)"/>
              <!-- Cabeça -->
              <rect x="9" y="12" width="32" height="24" rx="8" fill="var(--bg-control)" stroke="var(--border-color)" stroke-width="2"/>
              <!-- Face Plate -->
              <rect x="12" y="15" width="26" height="18" rx="5" fill="#0d1424" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
              <!-- Olhos -->
              <g id="mascot-eyes">
                <rect x="15" y="19" width="7" height="3.5" rx="1.75" fill="var(--color-cyan)"/>
                <rect x="28" y="19" width="7" height="3.5" rx="1.75" fill="var(--color-cyan)"/>
              </g>
              <!-- Bigode do Einstein -->
              <path d="M 16 28 C 19 25, 23 25, 25 28 C 27 25, 31 25, 34 28 C 36 30, 31 31, 25 29 C 19 31, 14 30, 16 28 Z" fill="#f8fafc" stroke="var(--text-muted)" stroke-width="1"/>
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
  // Validação e dicas do Desafio Ativo ou comportamento normal do Mascote
  if (window.activeChallenge) {
    const solved = window.activeChallenge.validate(state);
    if (solved) {
      window.updateMascot(
        `<b>Incrível! Desafio concluído! 🎉</b><br>Você resolveu a fórmula com precisão. Clique abaixo para escolher outro desafio:<br>` +
        `<button class="back" onclick="location.hash=''" style="margin-top: 10px; font-size: 11px; padding: 6px 12px; display: inline-flex;">← Voltar aos Desafios</button>`,
        "happy"
      );
    } else {
      window.updateMascot(
        `<b>Objetivo:</b> ${window.activeChallenge.goal}<br>` +
        `<span style="font-size: 12px; opacity: 0.75; display: block; margin-top: 4px;">Ajuste os parâmetros para resolver o mistério!</span>`,
        "thinking"
      );
    }
  } else if (current.mascot) {
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

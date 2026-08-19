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
        <path d="M 19 20.5 Q 22.5 16.5 26 20.5" stroke="#06b6d4" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M 34 20.5 Q 37.5 16.5 41 20.5" stroke="#06b6d4" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      `;
    } else if (expression === "surprised") {
      eyesHTML = `
        <circle cx="22.5" cy="20.5" r="3.5" fill="#06b6d4"/>
        <circle cx="37.5" cy="20.5" r="3.5" fill="#06b6d4"/>
      `;
    } else if (expression === "thinking") {
      eyesHTML = `
        <line x1="19" y1="21.5" x2="26" y2="18.5" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="34" y1="18.5" x2="41" y2="21.5" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round"/>
      `;
    } else {
      eyesHTML = `
        <rect x="19" y="19" width="7" height="3.5" rx="1.75" fill="#06b6d4"/>
        <rect x="34" y="19" width="7" height="3.5" rx="1.75" fill="#06b6d4"/>
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
let activeChallengeSubject = "Matemática";

const CHALLENGES = [
  {
    id: "desafio_quadrado",
    title: "Desafio do Quadrado Perfeito",
    desc: "Ajuste o Lado (L) de forma que a área do quadrado seja exatamente igual a 36.0 u.a.!",
    pageId: "square",
    goal: "Ajuste o Lado (L) para que a Área seja exatamente 36.00",
    subject: "Matemática",
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
    subject: "Matemática",
    validate(s) {
      return s.triType === "Retângulo" && s.ang > 0 && s.ang < 180;
    }
  },
  {
    id: "desafio_media_aprovada",
    title: "Média Aprovada",
    desc: "Ajuste as notas e pesos de modo que a média final ponderada do aluno seja exatamente 7.0.",
    pageId: "mediaPonderada",
    goal: "Ajuste os valores para obter uma Média Ponderada de exatamente 7.00",
    subject: "Matemática",
    validate(s) {
      return Math.abs(s.M - 7.00) < 0.01;
    }
  },
  {
    id: "desafio_queda_terra",
    title: "Gravidade Terrestre",
    desc: "Ajuste a gravidade para a da Terra (9.8 m/s²) e defina o tempo de queda para atingir uma altura final entre 44 e 45 metros.",
    pageId: "quedaLivre",
    goal: "Defina g = 9.8 m/s² e ajuste o tempo t para que a altura h fique entre 44.0m e 45.0m",
    subject: "Física",
    validate(s) {
      return Math.abs(s.g - 9.8) < 0.1 && s.h >= 44 && s.h <= 45;
    }
  },
  {
    id: "desafio_corrente_segura",
    title: "Corrente Segura",
    desc: "Ajuste a Tensão (V) e a Resistência (R) de forma que a Corrente Elétrica (I) resultante na Lei de Ohm seja exatamente igual a 2.0 A.",
    pageId: "ohm",
    goal: "Ajuste a Tensão e a Resistência para obter uma corrente I de exatamente 2.0 A",
    subject: "Física",
    validate(s) {
      return Math.abs(s.I - 2.00) < 0.02;
    }
  },
  {
    id: "desafio_encontro_alvo",
    title: "Encontro no Alvo",
    desc: "No Movimento Uniforme, defina o tempo t = 4.0s e ajuste a velocidade e posição inicial para que o objeto termine na marca de 10 metros.",
    pageId: "mru",
    goal: "Ajuste s0 e v para obter s = 10.0 m no tempo fixado em t = 4.0 s",
    subject: "Física",
    validate(s) {
      return Math.abs(s.s - 10.00) < 0.02 && Math.abs(s.t - 4.0) < 0.01;
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

window.selectChallengeSubject = function(subject) {
  activeChallengeSubject = subject;
  showMenu();
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
        
        <div class="challenge-sub-selector">
          <button id="btn-sub-mat" class="sub-btn ${activeChallengeSubject === "Matemática" ? "active" : ""}" onclick="selectChallengeSubject('Matemática')">Matemática</button>
          <button id="btn-sub-fis" class="sub-btn ${activeChallengeSubject === "Física" ? "active" : ""}" onclick="selectChallengeSubject('Física')">Física</button>
        </div>
        
        <div class="menu-grid">
    `;
    const filtered = CHALLENGES.filter(c => c.subject === activeChallengeSubject);
    for (const ch of filtered) {
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
    <div class="page-head">
      <div class="topline">
        <button class="back" onclick="location.hash=''">← Voltar ao Menu</button>
        <button id="theme-toggle-btn" class="theme-btn-inline" onclick="toggleTheme()">
          ${document.body.classList.contains("light-mode") ? "☀️ Claro" : "🌙 Escuro"}
        </button>
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
            <svg viewBox="0 0 60 60" width="60" height="60" style="overflow: visible;">
              <defs>
                <!-- Gradiente Metálico para o Corpo/Cabeça -->
                <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="60%" stop-color="#f1f5f9"/>
                  <stop offset="100%" stop-color="#cbd5e1"/>
                </linearGradient>
                
                <!-- Gradiente da Face Glassmorphic -->
                <linearGradient id="screen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#0b0f19"/>
                  <stop offset="100%" stop-color="#1e293b"/>
                </linearGradient>
                
                <!-- Brilho Neon para Elementos Ciano -->
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- Cabelo Cientista Louco (Spiky/Einstein Style) -->
              <path d="M 12 15 C 8 8, 3 13, 5 19 C 1 20, 0 25, 4 28 C 1 31, 3 35, 8 32 C 12 35, 14 31, 13 28" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
              <path d="M 48 15 C 52 8, 57 13, 55 19 C 59 20, 60 25, 56 28 C 59 31, 57 35, 52 32 C 48 35, 46 31, 47 28" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
              <path d="M 18 10 C 14 3, 22 2, 25 7 C 28 2, 36 3, 35 10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
              
              <!-- Antena com LED Ciano -->
              <line x1="30" y1="9" x2="30" y2="3" stroke="#94a3b8" stroke-width="2"/>
              <circle cx="30" cy="3" r="2.5" fill="#06b6d4" filter="url(#neon-glow)"/>

              <!-- Orelhas Laterais -->
              <rect x="11" y="21" width="3" height="7" rx="1.5" fill="#64748b"/>
              <rect x="46" y="21" width="3" height="7" rx="1.5" fill="#64748b"/>

              <!-- Cabeça Principal -->
              <rect x="13" y="12" width="34" height="25" rx="10" fill="url(#metal)" stroke="#94a3b8" stroke-width="1.5"/>
              
              <!-- Tela da Face -->
              <rect x="16" y="15" width="28" height="19" rx="6" fill="url(#screen)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
              
              <!-- Olhos Dinâmicos -->
              <g id="mascot-eyes" filter="url(#neon-glow)">
                <rect x="19" y="19" width="7" height="3.5" rx="1.75" fill="#06b6d4"/>
                <rect x="34" y="19" width="7" height="3.5" rx="1.75" fill="#06b6d4"/>
              </g>

              <!-- Reflexo de Vidro na Tela -->
              <path d="M 17 16 L 43 16 A 1 1 0 0 1 44 17 L 44 20 L 16 23 L 16 17 A 1 1 0 0 1 17 16 Z" fill="rgba(255,255,255,0.06)"/>

              <!-- Bigode Clássico de Einstein -->
              <path d="M 21 28 Q 30 24 39 28 Q 30 33 21 28 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>

              <!-- Corpo -->
              <rect x="27" y="36" width="6" height="4" fill="#64748b"/>
              <path d="M 22 39 L 19 46 A 2 2 0 0 0 21 49 L 39 49 A 2 2 0 0 0 41 46 L 38 39 Z" fill="url(#metal)" stroke="#94a3b8" stroke-width="1.5"/>
              <circle cx="30" cy="44" r="2.5" fill="#06b6d4" filter="url(#neon-glow)"/>
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

/*
  ============================================================
  BLOCK AI — JavaScript Application Logic
  ============================================================
  Versión: 1.0.0
  Runtime: JavaScript Vanilla (ES6+)
  Patrón: Module pattern con funciones init()

  ARQUITECTURA:
  El JS se organiza en módulos funcionales independientes,
  cada uno con una función init*() que se dispara en DOMContentLoaded.
  Esto mantiene el código:
  - Desacoplado (cada módulo es autónomo)
  - Testeable (cada init puede llamarse individualmente)
  - Mantenible (cambios locales no afectan otros módulos)

  MÓDULOS:
  1. Particles System  → Canvas API + requestAnimationFrame
  2. Typing Effect     → SetTimeout recursivo con efecto máquina
  3. Scroll Reveal     → Intersection Observer
  4. Animated Counters → requestAnimationFrame + easing
  5. Nav Scroll        → Event listener con clase toggle
  6. Mobile Nav        → Toggle + outside click
  7. Active Nav        → Intersection Observer spy
  8. Mouse Glow        → requestAnimationFrame con lerp
  9. Timeline          → Intersection Observer + secuencial
  10. Interactive Terminal → Command pattern
  11. Chart Bars       → Intersection Observer + CSS transition
  ============================================================
*/

'use strict';


// ============================================================
// DOM READY — Entry Point
// ============================================================
/*
  Todas las inicializaciones ocurren en DOMContentLoaded.
  No usamos window.onload porque no necesitamos esperar
  imágenes o recursos externos (todo es texto + SVG inline).
*/
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTypingEffect();
  initScrollReveal();
  initCounters();
  initNavScroll();
  initMobileNav();
  initActiveNav();
  initMouseGlow();
  initTimeline();
  initTerminal();
  initChartBars();
});


// ============================================================
// 1. PARTICLES SYSTEM
// ============================================================
/*
  Sistema de partículas con Canvas API.
  POR QUÉ Canvas y no DOM: Performance.
  - 80+ partículas animadas en DOM causaría reflows constantes
  - Canvas opera directamente sobre pixeles, sin layout thrashing
  - Offload del rendering a la GPU

  CARACTERÍSTICAS:
  - Partículas indigo y cyan con opacidad variable
  - Conexiones entre partículas cercanas (<140px)
  - Interacción con el mouse (repulsión suave)
  - Pausa automática cuando la pestaña no está visible
  - Escalado responsive (cantidad basada en área de pantalla)

  OPTIMIZACIONES:
  - Partículas recicladas (sin crear/eliminar en cada frame)
  - Wrap-around en lugar de desaparecer al borde
  - mouseX/Y inicializados lejos (-1000) para evitar glitch inicial
*/
function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;  // Guard clause: si no existe el canvas, salimos

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = -1000, mouseY = -1000;
  let animationId;

  // Resize handler: ajusta canvas al viewport actual
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  /*
    Particle class: Cada partícula es una instancia con:
    - Posición (x, y) aleatoria
    - Velocidad (speedX, speedY) lenta (<0.3px/frame)
    - Tamaño pequeño (0.5-2.5px)
    - Opacidad y hue para variación visual
  */
  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.hue = Math.random() > 0.5 ? 240 : 180; // Indigo o cyan
    }

    /*
      Update: Movimiento + interacción mouse.
      Si el mouse está cerca (<120px), aplicamos fuerza de repulsión
      que aleja la partícula del cursor.
      Wrap-around para reciclaje infinito.
    */
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse repulsion: Fuerza inversamente proporcional a la distancia
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += dx * force * 0.02;
        this.y += dy * force * 0.02;
      }

      // Wrap-around en lugar de eliminar partículas
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.hue === 240
        ? `rgba(99, 102, 241, ${this.opacity})`
        : `rgba(34, 211, 238, ${this.opacity})`;
      ctx.fill();
    }
  }

  /*
    Cantidad adaptativa: Escala según el área de pantalla.
    Fórmula: area / 8000, máx 80 partículas.
    En una pantalla 1920x1080 = 2,073,600 → ~259 pero cap en 80.
    Esto asegura rendimiento en monitores grandes.
  */
  const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 80);
  for (let i = 0; i < particleCount; i++) particles.push(new Particle());

  /*
    Conexiones: Dibuja líneas entre partículas cercanas.
    Opacidad inversamente proporcional a la distancia.
    O(n²) pero con partículas limitadas a 80 es aceptable.
    80² = 6400 operaciones por frame → sin impacto perceptible.
  */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          const opacity = (1 - dist / 140) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /*
    Game loop: requestAnimationFrame para 60fps consistentes.
    Limpia el canvas y redibuja todo en cada frame.
    No usamos delta time porque las velocidades son fijas y bajas.
  */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animationId = requestAnimationFrame(animate);
  }

  animate();

  // Mouse tracking: Actualiza posición para interacción
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  /*
    Visibility change: Pausa el loop cuando la pestaña está oculta.
    Ahorra batería y CPU en equipos móviles.
    Importante para Lighthouse/performance audits.
  */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });
}


// ============================================================
// 2. TYPING EFFECT
// ============================================================
/*
  Efecto máquina de escribir con rotación de frases.
  Implementación recursiva con setTimeout (no setInterval).

  POR QUÉ setTimeout recursivo:
  - Permite delays variables (60-100ms typing, 30-50ms deleting)
  - Más control sobre el flujo que setInterval
  - Fácil de pausar/reanudar

  FLUJO:
  1. Escribe caracteres uno a uno (60-100ms)
  2. Pausa 2.5s al completar la frase
  3. Borra caracteres uno a uno (30-50ms)
  4. Pausa 500ms
  5. Pasa a la siguiente frase (cíclico)
*/
function initTypingEffect() {
  const el = document.getElementById('typingEffect');
  if (!el) return;

  // Banco de frases — todas en español, con tono técnico
  const phrases = [
    'backend dev con visión de IA',
    'analizando datos, no hype',
    'arquitectura > frameworks',
    'pensamiento sistémico',
    'futuro ingeniero en IA',
    'código que transforma',
    'productividad real',
    'construyendo sistemas inteligentes'
  ];

  let phraseIdx = 0, charIdx = 0, deleting = false, paused = false;

  function type() {
    const current = phrases[phraseIdx];

    // Pausa después de escribir completa
    if (paused) {
      setTimeout(type, 2000);
      paused = false;
      deleting = true;
      return;
    }

    if (!deleting) {
      // Escribiendo: añade un caracter
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        paused = true;
        setTimeout(type, 2500); // Pausa larga al final
        return;
      }
      // Velocidad variable para naturalidad (60-100ms)
      setTimeout(type, 60 + Math.random() * 40);
    } else {
      // Borrando: quita un caracter
      el.textContent = current.substring(0, charIdx);
      charIdx--;
      if (charIdx < 0) {
        deleting = false;
        charIdx = 0;
        phraseIdx = (phraseIdx + 1) % phrases.length; // Cíclico
        setTimeout(type, 500);
        return;
      }
      // Más rápido borrando (30-50ms)
      setTimeout(type, 30 + Math.random() * 20);
    }
  }

  // Empieza después de 1s para permitir que el hero cargue primero
  setTimeout(type, 1000);
}


// ============================================================
// 3. SCROLL REVEAL
// ============================================================
/*
  Sistema de animaciones lazy usando Intersection Observer.
  Cuando un elemento con [data-reveal] entra en viewport:
  1. Se añade la clase .revealed
  2. Se aplica transition-delay si tiene [data-delay]
  3. Se deja de observar (rendimiento)

  POR QUÉ Intersection Observer:
  - Zero main-thread work mientras se scrollea
  - No es necesario calcular posiciones manualmente
  - El navegador optimiza internamente las detecciones
  - Callback solo cuando cruza el threshold
*/
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Leer delay del atributo HTML o default 0
        const delay = entry.target.getAttribute('data-delay') || '0';
        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target); // No observar más
      }
    });
  }, {
    threshold: 0.08,         // 8% visible ya dispara
    rootMargin: '0px 0px -60px 0px' // Dispara 60px antes de llegar
  });

  els.forEach(el => obs.observe(el));
}


// ============================================================
// 4. ANIMATED COUNTERS
// ============================================================
/*
  Contadores que animan desde 0 hasta su valor objetivo.
  Disparados por Intersection Observer.

  ALGORITMO:
  - requestAnimationFrame para 60fps
  - Ease-out cúbico: 1 - (1 - t)³ para final suave
  - Duración: 2000ms (2 segundos)

  POR QUÉ requestAnimationFrame y no setInterval:
  - Sincronizado con el refresco del monitor
  - Menos saltos/tearing visual
  - Se pausa automáticamente en tabs ocultas
*/
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000; // 2 segundos
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cúbico para desaceleración suave al final
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target; // Asegura el valor exacto
        }

        requestAnimationFrame(update);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(el => obs.observe(el));
}


// ============================================================
// 5. NAV SCROLL EFFECT
// ============================================================
/*
  Añade/remueve clase .scrolled al header cuando el usuario
  scrollea más de 50px. Esto activa el glassmorphism en CSS.

  { passive: true } es importante para performance:
  Indica al navegador que no llamará preventDefault(),
  permitiendo optimizaciones en el scroll.
*/
function initNavScroll() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}


// ============================================================
// 6. MOBILE NAV
// ============================================================
/*
  Menú hamburguer para dispositivos táctiles.

  MANEJO DE ESTADOS:
  1. Click en toggle → Abre/cierra menú
  2. Click en link → Cierra menú + navega
  3. Click fuera → Cierra menú (outside click)

  aria-expanded se actualiza para accesibilidad.
*/
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('navLinks');
  if (!toggle || !nav) return;

  // Toggle: abre/cierra el menú
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', open);
  });

  // Click en link: cierra el menú
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Click fuera: cierra el menú
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}


// ============================================================
// 7. ACTIVE NAV LINK (Scroll Spy)
// ============================================================
/*
  Actualiza la clase .active en la navegación según la sección
  visible en el viewport. Usa Intersection Observer con un
  threshold del 20% + rootMargin para activación anticipada.

  rootMargin: '-20% 0px -20% 0px' crea una zona de detección
  central. La sección se considera "activa" cuando ocupa el
  20% central del viewport.
*/
function initActiveNav() {
  const sections = document.querySelectorAll('.section[id]');
  const links = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
        });
      }
    });
  }, { threshold: 0.2, rootMargin: '-20% 0px -20% 0px' });

  sections.forEach(s => obs.observe(s));
}


// ============================================================
// 8. MOUSE GLOW
// ============================================================
/*
  Efecto de iluminación que sigue al cursor con suavizado.
  Usa Linear Interpolation (lerp) para movimiento fluido.

  ALGORITMO:
  - mx/my: Posición exacta del mouse
  - cx/cy: Posición actual del glow (con interpolación)
  - factor 0.08: Velocidad de seguimiento (más bajo = más lento)
  - 60fps via requestAnimationFrame
*/
function initMouseGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let mx = -200, my = -200, cx = -200, cy = -200;

  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  // Lerp loop: interpola hacia la posición del mouse
  function anim() {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glow.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
    requestAnimationFrame(anim);
  }
  anim();

  // Ocultar en táctiles (no tiene sentido)
  if ('ontouchstart' in window) glow.style.display = 'none';
}


// ============================================================
// 9. TIMELINE ANIMATION
// ============================================================
/*
  Activa la línea de timeline y los items secuencialmente.

  FLUJO:
  1. Cuando el timeline entra en viewport →
  2. Añade .visible al contenedor (anima la línea gradient)
  3. Activa cada item con delay progresivo (200ms + i * 200ms)

  El primer item (1950) empieza con .active por defecto en HTML.
*/
function initTimeline() {
  const tl = document.querySelector('.timeline');
  if (!tl) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tl.classList.add('visible');
        // Activar items secuencialmente: 200ms, 400ms, 600ms...
        tl.querySelectorAll('.timeline-item').forEach((item, i) => {
          setTimeout(() => item.classList.add('active'), 200 + i * 200);
        });
        obs.unobserve(tl);
      }
    });
  }, { threshold: 0.15 });

  obs.observe(tl);
}


// ============================================================
// 10. INTERACTIVE TERMINAL
// ============================================================
/*
  Terminal interactiva falsa con sistema de comandos.
  Implementa el patrón Command: cada comando es un objeto
  con output y action opcional.

  ARQUITECTURA:
  - commands: Objeto registro con todos los comandos
  - addOutput(): Renderiza output en el body
  - addCmdLine(): Muestra el comando escrito por el usuario
  - process(): Busca el comando y ejecuta

  COMANDOS ESPECIALES:
  - clear: Vacía el body (no ejecuta output)
  - exit: Deshabilita el input permanentemente

  ESTADOS DEL INPUT:
  - Normal: placeholder "Escribe un comando..."
  - Disabled (exit): placeholder "Terminal cerrada"
*/
function initTerminal() {
  const input = document.getElementById('terminalInput');
  const body = document.getElementById('terminalBody');
  if (!input || !body) return;

  // Click en cualquier parte de la terminal hace focus al input
  const term = input.closest('.terminal');
  if (term) term.addEventListener('click', () => input.focus());

  /*
    Registro de comandos.
    Cada entrada tiene:
    - output: HTML string para renderizar
    - action (opcional): 'clear' o 'disable' para comportamiento especial
  */
  const commands = {
    help: {
      output: `
<strong>Comandos disponibles:</strong>
  <span class="highlight">help</span>      — Muestra esta ayuda
  <span class="highlight">about</span>     — Sobre mí
  <span class="highlight">skills</span>    — Mis habilidades técnicas
  <span class="highlight">roadmap</span>   — Mi ruta de aprendizaje
  <span class="highlight">future</span>    — Mi visión del futuro
  <span class="highlight">ai</span>        — Mi postura sobre IA
  <span class="highlight">backend</span>   — Stack backend
  <span class="highlight">clear</span>     — Limpiar la terminal
  <span class="highlight">os</span>        — Información del sistema
  <span class="highlight">contact</span>   — Cómo contactarme
  <span class="highlight">stats</span>     — Estadísticas de IA
  <span class="highlight">exit</span>      — Salir de la terminal`
    },
    about: {
      output: `
<strong>Kevin Dev</strong> — Backend Developer → Futuro IA Engineer

Soy un desarrollador backend en evolución constante hacia la inteligencia artificial. Creo en construir sobre bases sólidas: primero sistemas robustos, luego inteligencia.

Mi filosofía: <strong>datos > hype, arquitectura > frameworks, pensar > memorizar</strong>.

Actualmente profundizando en:
• Go y Node.js para backend
• Bases de datos relacionales y NoSQL
• Fundamentos de Machine Learning
• Arquitecturas de sistemas inteligentes`
    },
    skills: {
      output: `
<strong>Habilidades Técnicas</strong>

<span class="highlight">Backend</span>
  • Go (Golang)
  • Node.js / TypeScript
  • API REST / GraphQL
  • Microservicios

<span class="highlight">Bases de Datos</span>
  • PostgreSQL
  • MySQL
  • MongoDB
  • Redis

<span class="highlight">Herramientas</span>
  • Docker
  • Linux / Terminal
  • Git
  • CI/CD

<span class="highlight">En aprendizaje</span>
  • Machine Learning
  • NLP / LLMs
  • Agentes IA
  • Sistemas distribuidos`
    },
    roadmap: {
      output: `
<strong>Roadmap: Backend → IA Engineer</strong>

<span class="highlight">Fase 1 — Fundamentos (Actual)</span>
  • Backend sólido: Go, Node.js, TypeScript
  • Bases de datos: SQL, NoSQL, modelado
  • Arquitecturas: APIs, microservicios, patrones
  • DevOps: Docker, CI/CD, cloud

<span class="highlight">Fase 2 — Inteligencia</span>
  • Matemáticas para ML (álgebra, cálculo, estadística)
  • Machine Learning clásico
  • Deep Learning con Python
  • NLP y transformers

<span class="highlight">Fase 3 — Sistemas Inteligentes</span>
  • LLMs aplicados
  • Agentes autónomos
  • RAG y fine-tuning
  • IA en producción

<span class="highlight">Fase 4 — Especialización</span>
  • Investigación aplicada
  • Sistemas multi-agente
  • IA ética y responsable
  • Contribuciones open source`
    },
    future: {
      output: `
<strong>Mi visión del futuro</strong>

La IA no va a reemplazar desarrolladores. Los desarrolladores que <strong>usan IA</strong> van a reemplazar a los que no.

El futuro no es sobre escribir más código. Es sobre <strong>diseñar mejores sistemas</strong>. La IA se encargará de la implementación; nosotros de las decisiones fundamentales.

Lo que más importará:
• <strong>Pensamiento sistémico</strong> — entender cómo encajan las piezas
• <strong>Juicio técnico</strong> — saber qué construir y por qué
• <strong>Adaptabilidad</strong> — el stack cambia, los principios no
• <strong>Ética</strong> — con gran poder viene gran responsabilidad`
    },
    ai: {
      output: `
<strong>Mi postura sobre IA</strong>

Ni apocalipsis ni utopía. <strong>Realidad</strong>.

La IA es una herramienta extraordinaria con límites reales:
• No piensa, predice patrones
• No entiende contexto de negocio
• No reemplaza el juicio humano
• Alucina con frecuencia

Pero también:
• Automatiza lo repetitivo
• Acelera el aprendizaje
• Aumenta la productividad (si sabes usarla)
• Democratiza el acceso al conocimiento

La clave: <strong>usarla con criterio, no con fe</strong>.
Verificar siempre. Confiar, pero verificar.`
    },
    backend: {
      output: `
<strong>Stack Backend</strong>

• <span class="highlight">Go</span> — Mi lenguaje principal. Rápido, concurrente, simple.
• <span class="highlight">Node.js</span> — TypeScript para APIs y servicios.
• <span class="highlight">PostgreSQL</span> — Mi base de datos relacional favorita.
• <span class="highlight">Redis</span> — Caching y colas de mensajes.
• <span class="highlight">Docker</span> — Contenedores para entornos reproducibles.
• <span class="highlight">Linux</span> — Mi SO de desarrollo y producción.

Experiencia construyendo APIs REST, microservicios, y sistemas con arquitecturas limpias.`
    },
    clear: { output: null, action: 'clear' },
    os: {
      output: `
<strong>// SISTEMA</strong>
  <span class="highlight">OS</span>         Arch Linux btw
  <span class="highlight">Shell</span>      Zsh + Powerlevel10k
  <span class="highlight">Editor</span>     Neovim (LazyVim)
  <span class="highlight">Terminal</span>   Alacritty
  <span class="highlight">WM</span>        Sway (Wayland)
  <span class="highlight">Node</span>       v22.x
  <span class="highlight">Go</span>        v1.24.x
  <span class="highlight">Docker</span>    v27.x
  <span class="highlight">Uptime</span>     ∞ (siempre aprendiendo)`
    },
    contact: {
      output: `
<strong>Contacto</strong>

  • GitHub:   github.com/kevindev
  • LinkedIn: linkedin.com/in/kevindev
  • Email:    kevin@dev.io

Abierto a colaborar en proyectos de backend, IA, y tecnología que mueva la aguja.`
    },
    stats: {
      output: `
<strong>Estadísticas IA (2024-2025)</strong>

  <span class="highlight">76%</span>   de desarrolladores usa o planea usar IA (Stack Overflow 2024)
  <span class="highlight">62%</span>   de devs profesionales ya usan IA (vs 44% en 2023)
  <span class="highlight">77%</span>   de empresas españolas reportan mejora productividad
  <span class="highlight">43%</span>   de devs confía en la precisión de la IA
  <span class="highlight">65%</span>   de organizaciones ya adoptaron IA generativa (McKinsey)
  <span class="highlight">700M+</span> usuarios de ChatGPT (2025)
  <span class="highlight">+4%</span>   Ganancia productividad laboral UE (CEPR)

<strong>La brecha:</strong> Solo el 14% usa ChatGPT a diario en España.
El 44% reconoce tener poco o ningún conocimiento sobre IA.
El 21% nunca ha usado una herramienta de IA.`
    },
    exit: {
      output: `
<span class="info">◆ Terminal cerrada. Vuelve cuando quieras.</span>
<span class="info">◆ kevin@dev:~$ _</span>`,
      action: 'disable'
    }
  };

  /*
    Renderiza el output de un comando en el terminal body.
    El prompt ◆ indica que es output, no un comando escrito.
    scrollTop se actualiza para mantener el scroll al final.
  */
  function addOutput(html, cls = 'output') {
    const line = document.createElement('div');
    line.className = 'terminal-output';
    line.innerHTML = `<span class="terminal-prompt">◆</span><span class="terminal-output-line ${cls}">${html}</span>`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  /*
    Muestra el comando que el usuario escribió.
    Usa el prompt kevin@dev:~$ para simular una terminal real.
  */
  function addCmdLine(cmd) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="terminal-prompt">kevin@dev:~$</span><span class="terminal-output-line output" style="color: var(--color-text)"> ${cmd}</span>`;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  /*
    Procesador de comandos:
    1. Trim + lowercase para normalización
    2. Busca en el registro commands
    3. Si no existe → mensaje de error
    4. Si existe con action especial → ejecuta (clear/disable)
    5. Si existe sin action → renderiza output
  */
  function process(cmd) {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    const c = commands[trimmed];
    if (!c) {
      addOutput(`Comando no encontrado: "${trimmed}". Escribe <strong>help</strong> para ver los comandos disponibles.`, 'error');
      return;
    }

    // Clear: vacía el body y restaura el welcome message
    if (c.action === 'clear') {
      body.innerHTML = '';
      const w = document.createElement('div');
      w.className = 'terminal-line';
      w.innerHTML = `<span class="terminal-prompt">kevin@dev:~$</span><span class="terminal-welcome"> Terminal limpiada. Escribe <strong>help</strong> para comandos.</span>`;
      body.appendChild(w);
      return;
    }

    // Exit: deshabilita el input permanentemente
    if (c.action === 'disable') {
      input.disabled = true;
      input.placeholder = 'Terminal cerrada';
      addOutput(c.output, 'info');
      return;
    }

    // Comando normal: renderiza output
    addOutput(c.output);
  }

  // Enter key handler
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value;
      addCmdLine(cmd);
      process(cmd);
      input.value = '';
    }
  });
}


// ============================================================
// 11. CHART BARS
// ============================================================
/*
  Anima las barras del gráfico cuando entran en viewport.
  Las barras empiezan con height: 4% (mínimo visible) y
  animan vía CSS transition cuando JS setea la altura real.

  La transición CSS (height 1.5s cubic-bezier) se encarga
  del easing — solo necesitamos cambiar el valor de height.
*/
function initChartBars() {
  const container = document.querySelector('.chart-container');
  const bars = document.querySelectorAll('.chart-bar');
  if (!bars.length || !container) return;

  // Estado inicial: todas las barras al mínimo
  bars.forEach(b => b.style.height = '4%');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Leer data-value y aplicar como altura
        entry.target.querySelectorAll('.chart-bar').forEach(bar => {
          bar.style.height = `${bar.getAttribute('data-value')}%`;
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  obs.observe(container);
}

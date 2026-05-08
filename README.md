<div align="center">
  <br/>
  <img src="https://img.shields.io/badge/status-production-22d3ee?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/stack-vanilla-6366f1?style=flat-square" alt="Stack">
  <img src="https://img.shields.io/badge/deploy-vercel-000000?style=flat-square&logo=vercel" alt="Deploy">
  <img src="https://img.shields.io/badge/license-MIT-34d399?style=flat-square" alt="License">

  <br/>
  <br/>

  <h1 align="center">
    ◆ BLOCK AI
  </h1>

  <p align="center">
    <strong>Portfolio & Investigación sobre Inteligencia Artificial</strong>
    <br/>
    Desarrollo · Productividad · Visión Crítica · Datos Reales
  </p>

  <br/>

  <p align="center">
    <a href="#-descripción">Descripción</a> •
    <a href="#-características">Características</a> •
    <a href="#-stack-tecnológico">Stack</a> •
    <a href="#-secciones">Secciones</a> •
    <a href="#-instalación">Instalación</a>
  </p>

  <br/>
</div>

---

## 📋 Descripción

**Block AI** es un portfolio/blog tecnológico premium construido con **HTML5, CSS3 y JavaScript Vanilla** que analiza el impacto real de la inteligencia artificial en el desarrollo de software y la sociedad.

El proyecto combina **investigación basada en datos** (Funcas, INE, Stack Overflow, CEPR, McKinsey) con una **experiencia visual tipo SaaS premium** inspirada en Vercel, Linear, OpenAI y Stripe.

No es marketing. No es hype. Es **análisis tecnológico serio** con visión crítica y datos verificables.

---

## ✨ Características

| Categoría | Detalle |
|-----------|---------|
| 🎨 **Diseño** | Dark mode, glassmorphism, gradientes modernos, grid tecnológico |
| 📱 **Responsive** | Mobile-first, hamburger nav, layouts adaptativos |
| 🎬 **Animaciones** | Partículas canvas, typing effect, scroll reveal, counters animados |
| 📊 **Datos** | Gráfico de barras animado, tabla comparativa, estadísticas verificables |
| ⌨️ **Terminal** | Terminal interactiva con 12 comandos (help, about, skills, etc.) |
| 🧠 **Timeline** | Línea temporal interactiva de 1950 a 2025 |
| 🖱️ **UX** | Mouse glow, hover effects, transiciones fluidas, scroll spy |
| ♿ **Accesibilidad** | ARIA labels, roles semánticos, reduced motion support |

---

## 🛠 Stack Tecnológico

```
Frontend
├── HTML5            → Estructura semántica y accesible
├── CSS3             → Design tokens, grid, flexbox, animaciones
└── JavaScript       → Vanilla JS, Canvas API, Intersection Observer

Deploy
└── Vercel           → Hosting estático con headers de seguridad
```

---

## 📁 Estructura del Proyecto

```
block-ai/
├── index.html       → 13 secciones, 924 líneas de HTML semántico
├── styles.css       → 2,051 líneas de CSS con sistema de diseño completo
├── script.js        → 632 líneas de JS vanilla con 11 módulos
├── vercel.json      → Config de deploy con seguridad y caché
├── README.md        → Documentación del proyecto
└── assets/          → Recursos estáticos (imágenes, etc.)
```

---

## 🧩 Secciones del Sitio

| # | Sección | Contenido |
|---|---------|-----------|
| 1 | **Hero** | Partículas animadas, typing effect, stats clave (700M+, 76%, 65%) |
| 2 | **Sobre mí** | 4 cards con glassmorphism: backend, IA, visión crítica, pensamiento sistémico |
| 3 | **IA en datos** | Featured stat, 4 stat cards, gráfico barras ChatGPT, tabla por países |
| 4 | **Productividad real vs hype** | Comparativa dual (✅ real / ❌ humo), insight box Harvard |
| 5 | **Lo que no entienden** | 4 cards con datos INE/Funcas, big stat 80% |
| 6 | **IA y programación** | 6 cards: rol, productividad, debugging, arquitecturas, etc. |
| 7 | **Riesgos y contras** | 8 cards: alucinaciones, dependencia, seguridad, legal, etc. |
| 8 | **Mitos IA** | 4 Q&A cards: "IA reemplaza", "IA piensa", "AGI", "prompt engineer" |
| 9 | **Referentes** | 5 cards: Sam Altman, Jensen Huang, Satya, Musk, Hinton |
| 10 | **Timeline evolución** | 7 hitos: 1950 (Turing) → 2025 (Agentes IA) |
| 11 | **IA y sociedad** | 6 cards: educación, trabajo, brecha, desigualdad, etc. |
| 12 | **Terminal interactiva** | 12 comandos con output dinámico |
| 13 | **Footer** | Navegación secundaria, redes sociales |

---

## 📐 Aprendizajes Técnicos

### Arquitectura Visual

El diseño sigue un **sistema de diseño basado en tokens CSS** con variables personalizadas para colores, tipografía, espaciado y animaciones. Esto garantiza consistencia visual y facilita el mantenimiento.

### Animaciones con Rendimiento

- **Canvas API** para partículas (no DOM) — 80 partículas con interacción mouse
- **Intersection Observer** para scroll reveal, counters, timeline y chart bars — sin librerías
- **requestAnimationFrame** para animaciones continuas (partículas, mouse glow)
- **CSS transitions** con cubic-bezier para hover states y micro-interacciones

### Responsive Design

Estrategia **mobile-first** con 3 breakpoints:
- `≤480px` — Mobile (tipografía reducida, layouts simplificados)
- `≤768px` — Tablet (hamburger nav, stacked grids)
- Default — Desktop (glassmorphism nav, multi-column layouts)

### Accesibilidad y UX

- ARIA roles en navegación (`menubar`, `menuitem`, `navigation`)
- `prefers-reduced-motion` respetado globalmente
- `prefers-color-scheme` para light mode
- Semantic HTML con landmarks (`<main>`, `<nav>`, `<footer>`, `<section>`)
- Scroll spy con Intersection Observer para navegación activa

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/block-ai.git
cd block-ai

# 2. Abrir con VS Code (opcional)
code .

# 3. Servir localmente con Live Server
# Instalar extensión "Live Server" en VS Code
# Click derecho en index.html → "Open with Live Server"
```

El proyecto es **100% estático** — no requiere build, dependencias ni configuración adicional.

---

## 🌐 Deploy

### Vercel (recomendado)

```bash
# 1. Conectar repo a Vercel
vercel --prod

# O desde el dashboard de Vercel:
# 1. Importar repositorio de GitHub
# 2. Framework: Otro
# 3. Build: Ninguno
# 4. Output: ./
```

El archivo `vercel.json` incluye:
- **`cleanUrls: true`** — URLs sin extensión `.html` (más limpias)
- **Headers de seguridad**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

> Al ser un sitio 100% estático (HTML + CSS + JS), Vercel lo detecta automáticamente y no necesita configuración adicional. El `vercel.json` es solo para los detalles de seguridad y URLs limpias.

---

## 🗺 Roadmap Futuro

- [ ] **Backend integration** — Node.js/Go para servir contenido dinámico
- [ ] **CMS headless** — Gestión de artículos desde Strapi o Sanity
- [ ] **Blog dinámico** — Posts sobre IA con markdown y syntax highlighting
- [ ] **API IA** — Endpoints para generar análisis automatizados
- [ ] **Internacionalización** — Soporte multi-idioma (EN/ES)
- [ ] **Modo interactivo** — Dashboard con datos de IA en tiempo real
- [ ] **Migración React** — Versión componentizada con Next.js

---

<div align="center">
  <br/>
  <p>
    Hecho con ◆ por <strong>Kevin Dev</strong>
    <br/>
    <sub>Backend · IA · Visión tecnológica crítica</sub>
  </p>
  <br/>
</div>

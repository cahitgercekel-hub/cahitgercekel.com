// Shared CSS for the portfolio site (used by both Index and ProjectDetail pages).
// Keep .portfolio-root scoped so styles never leak to the admin app.

export const PORTFOLIO_CSS = `
  .portfolio-root { font-family: var(--p-font); background: var(--p-bg); color: var(--p-fg); min-height: 100vh; }
  .portfolio-root nav.p-nav { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); width: calc(100% - 40px); max-width: 960px; background: rgba(255,255,255,0.55); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); border: 1px solid rgba(255,255,255,0.45); border-radius: calc(var(--p-radius) + 6px); padding: 12px 24px; z-index: 100; box-shadow: 0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6); transition: box-shadow .3s ease, background .3s ease; }
  .portfolio-root nav.p-nav .p-nav-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .portfolio-root .p-nav-burger { display: none; background: transparent; border: 0; padding: 6px; cursor: pointer; flex-direction: column; gap: 5px; }
  .portfolio-root .p-nav-burger span { display: block; width: 22px; height: 2px; background: var(--p-fg); border-radius: 2px; transition: transform .25s ease, opacity .25s ease; }
  .portfolio-root nav.p-nav.menu-open .p-nav-burger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .portfolio-root nav.p-nav.menu-open .p-nav-burger span:nth-child(2) { opacity: 0; }
  .portfolio-root nav.p-nav.menu-open .p-nav-burger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .portfolio-root .p-mobile-menu { list-style: none; margin: 12px 0 4px; padding: 8px 0 4px; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid var(--p-border); animation: pNavFade .2s ease-out; }
  .portfolio-root .p-mobile-menu li a { display: block; padding: 12px 6px; text-decoration: none; color: var(--p-fg); font-size: 1rem; font-weight: 500; }
  .portfolio-root .p-mobile-menu li a:hover { color: var(--p-accent); }
  @keyframes pNavFade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  .portfolio-root nav.p-nav.scrolled { box-shadow: 0 8px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7); background: rgba(255,255,255,0.65); }
  .portfolio-root .p-logo { font-family: var(--p-font); font-weight: 800; font-size: 1.15rem; display: inline-flex; align-items: baseline; white-space: nowrap; }
  .portfolio-root .p-logo a { color: inherit; text-decoration: none; display: inline-flex; align-items: baseline; }
  .portfolio-root .p-logo-word { display: inline-flex; align-items: baseline; }
  .portfolio-root .p-logo-word + .p-logo-word { margin-left: 0.28em; transition: margin-left .25s ease; }
  .portfolio-root .p-logo-rest { display: inline-block; max-width: 10ch; overflow: hidden; opacity: 1; transform: translateX(0); transition: max-width .25s ease, opacity .15s ease, transform .25s ease; }
  .portfolio-root nav.p-nav.scrolled .p-logo-word + .p-logo-word { margin-left: 0; }
  .portfolio-root nav.p-nav.scrolled .p-logo-rest { max-width: 0; opacity: 0; transform: translateX(8px); }
  .portfolio-root .p-logo-dot { color: var(--p-accent); }
  .portfolio-root .p-nav-links { display: flex; gap: 28px; list-style: none; margin:0; padding:0; }
  .portfolio-root .p-nav-links a { text-decoration: none; color: var(--p-fg); font-size: 0.9rem; font-weight: 500; }
  .portfolio-root .p-nav-links a:hover { color: var(--p-accent); }
  .portfolio-root .p-section { padding: 100px 40px; }
  .portfolio-root .p-section.alt { background: #fff; }
  .portfolio-root .p-inner { max-width: 960px; margin: 0 auto; }
  .portfolio-root .p-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--p-accent); margin-bottom: 10px; }
  .portfolio-root .p-title { font-family: var(--p-font); font-weight: 800; font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -1.5px; margin-bottom: 40px; line-height: 1.1; }
  .portfolio-root .p-hero { min-height: 100vh; display: flex; align-items: center; background: var(--p-hero); padding: 120px 40px 80px; }
  .portfolio-root .p-hero-grid { display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center; width: 100%; }
  .portfolio-root .p-hero-grid.has-image { grid-template-columns: 1.2fr 1fr; }
  .portfolio-root .p-hero-tag { display: inline-block; background: rgba(255,255,255,0.25); color: #fff; border-radius: 100px; padding: 6px 16px; font-size: 0.85rem; font-weight: 500; margin-bottom: 24px; backdrop-filter: blur(4px); }
  .portfolio-root .p-hero-title { font-family: var(--p-font); font-weight: 800; font-size: clamp(3rem, 7vw, 5.5rem); line-height: 1.05; color: #fff; letter-spacing: -2px; margin-bottom: 20px; }
  .portfolio-root .p-hero-title .dot { color: var(--p-accent3); }
  .portfolio-root .p-hero-sub { font-size: 1.25rem; color: rgba(255,255,255,0.85); max-width: 480px; line-height: 1.6; margin-bottom: 36px; }
  .portfolio-root .p-hero-photo { width: 100%; aspect-ratio: 1 / 1; max-width: 360px; justify-self: center; border-radius: calc(var(--p-radius) * 2); object-fit: cover; box-shadow: 0 20px 60px rgba(0,0,0,0.25); border: 4px solid rgba(255,255,255,0.4); }
  .portfolio-root .p-btns { display: flex; gap: 14px; flex-wrap: wrap; align-items: stretch; }
  .portfolio-root .p-btns > a { min-height: 52px; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; }
  .portfolio-root .p-btn-primary { background: #fff; color: var(--p-accent); border: 2px solid #fff; border-radius: var(--p-radius); padding: 12px 26px; font-size: 1rem; font-weight: 700; cursor: pointer; text-decoration:none; box-shadow: 0 6px 18px rgba(0,0,0,0.18); transition: transform .2s ease, box-shadow .2s ease; }
  .portfolio-root .p-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.25); }
  .portfolio-root .p-btn-ghost { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.6); border-radius: var(--p-radius); padding: 12px 26px; font-size: 1rem; font-weight: 600; cursor: pointer; text-decoration:none; box-shadow: 0 6px 18px rgba(0,0,0,0.15); transition: transform .2s ease, box-shadow .2s ease; }
  .portfolio-root .p-btn-ghost:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.22); }
  .portfolio-root .p-btn-cv { background: var(--p-fg); color: #fff; border: 2px solid var(--p-fg); border-radius: var(--p-radius); padding: 12px 26px; font-size: 1rem; font-weight: 700; text-decoration: none; gap: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.22); transition: transform .2s ease, box-shadow .2s ease; }
  .portfolio-root .p-btn-cv:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.3); }
  .portfolio-root .p-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
  .portfolio-root .p-about-text p { font-size: 1.05rem; line-height: 1.75; color: #444; margin-bottom: 16px; }
  .portfolio-root .p-about-portrait { width: 100%; border-radius: calc(var(--p-radius) * 1.5); object-fit: cover; }
  .portfolio-root .p-skills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
  .portfolio-root .p-skill { background: var(--p-fg); color: #fff; padding: 6px 14px; border-radius: 100px; font-size: 0.82rem; font-weight: 600; }
  .portfolio-root .p-skill-group { margin-bottom: 28px; }
  .portfolio-root .p-skill-group h4 { font-family: var(--p-font); font-size: 0.95rem; font-weight: 700; margin: 0 0 10px; color: var(--p-fg); }
  .portfolio-root .p-skill-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .portfolio-root .p-pill { background: #fff; border: 1px solid var(--p-border); color: var(--p-fg); padding: 8px 16px; border-radius: 100px; font-size: 0.85rem; font-weight: 500; }
  .portfolio-root .p-stat-label { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; }
  .portfolio-root .p-stat-track { background: var(--p-border); border-radius: 6px; height: 8px; overflow: hidden; margin-bottom: 18px; }
  .portfolio-root .p-stat-fill { height: 100%; border-radius: 6px; background: var(--p-accent); }
  .portfolio-root .p-lang-row { display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; }
  .portfolio-root .p-lang-level { color: var(--p-muted); font-weight: 500; font-size: 0.85rem; }
  .portfolio-root .p-projects { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
  .portfolio-root .p-card { background: var(--p-bg); border-radius: calc(var(--p-radius) + 6px); overflow: hidden; border: 1px solid var(--p-border); transition: transform .25s; display: flex; flex-direction: column; }
  .portfolio-root .p-card:hover { transform: translateY(-6px); }
  .portfolio-root .p-card.featured { border-color: var(--p-accent); box-shadow: 0 8px 24px hsl(from var(--p-accent) h s l / 0.2); }
  .portfolio-root a.p-card { color: inherit; text-decoration: none; }
  .portfolio-root a.p-card:hover h3 { color: var(--p-accent); }
  .portfolio-root .p-card-thumb { height: 160px; display:flex; align-items:center; justify-content:center; font-size: 2.5rem; background: linear-gradient(135deg, var(--p-accent), var(--p-accent3)); color:#fff; }
  .portfolio-root .p-card-thumb img { width:100%; height:100%; object-fit:cover; }
  .portfolio-root .p-card-body { padding: 20px; }
  .portfolio-root .p-card-tag { font-size: 0.72rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--p-accent); margin-bottom: 6px; }
  .portfolio-root .p-card h3 { font-family: var(--p-font); font-size: 1.1rem; margin: 0 0 8px; transition: color .2s ease; }
  .portfolio-root .p-card p { font-size: 0.88rem; color: var(--p-muted); line-height: 1.6; margin-bottom: 16px; }
  .portfolio-root .p-card .p-card-cta { font-size: 0.85rem; font-weight: 700; color: var(--p-accent); text-decoration: none; }
  .portfolio-root .p-timeline { position: relative; padding-left: 28px; }
  .portfolio-root .p-timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: var(--p-border); }
  .portfolio-root .p-tl-item { position: relative; margin-bottom: 44px; }
  .portfolio-root .p-tl-dot { position: absolute; left: -28px; top: 5px; width: 14px; height: 14px; border-radius: 50%; background: var(--p-accent); border: 2px solid #fff; box-shadow: 0 0 0 3px var(--p-accent); }
  .portfolio-root .p-tl-period { font-size: 0.78rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--p-muted); margin-bottom: 4px; }
  .portfolio-root .p-tl-role { font-family: var(--p-font); font-size: 1.15rem; font-weight: 700; }
  .portfolio-root .p-tl-company { font-size: 0.95rem; color: var(--p-accent); font-weight: 600; text-decoration: none; }
  .portfolio-root a.p-tl-company:hover { text-decoration: underline; }
  .portfolio-root .p-tl-company-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .portfolio-root .p-tl-logo { width: 22px; height: 22px; border-radius: 6px; object-fit: cover; background: rgba(0,0,0,0.04); }
  .portfolio-root .p-tl-desc { font-size: 0.92rem; color: #555; line-height: 1.65; }
  .portfolio-root .p-contact-info p { font-size: 1.05rem; color: #555; line-height: 1.7; margin-bottom: 24px; }
  .portfolio-root .p-contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
  .portfolio-root .p-contact-link { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--p-fg); font-weight: 500; padding: 14px 18px; border-radius: var(--p-radius); border: 1px solid var(--p-border); background: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.06); transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease, background .25s ease; }
  .portfolio-root .p-contact-link:hover { transform: translateY(-4px); background: var(--p-bg); border-color: var(--p-accent); box-shadow: 0 12px 28px rgba(0,0,0,0.14); }
  .portfolio-root .p-contact-icon { width: 22px; height: 22px; object-fit: contain; }
  .portfolio-root .p-logos-section { padding: 60px 40px; }
  .portfolio-root .p-logos-label { font-size: 0.85rem; font-weight: 500; letter-spacing: 2px; color: var(--p-muted); text-align: center; margin-bottom: 28px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .portfolio-root .p-logos-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 48px; }
  .portfolio-root .p-logo-item { display: inline-flex; align-items: center; justify-content: center; filter: grayscale(100%); opacity: 0.55; transition: filter .35s ease, opacity .35s ease, transform .35s ease; }
  .portfolio-root .p-logo-item:hover { filter: grayscale(0%); opacity: 1; transform: translateY(-2px); }
  .portfolio-root .p-logo-item img { max-height: 56px; max-width: 140px; width: auto; height: auto; object-fit: contain; display: block; }
  .portfolio-root .p-footer { background: var(--p-fg); color: rgba(255,255,255,0.7); padding: 40px; text-align:center; font-size: 0.88rem; }
  .portfolio-root .p-lang-pill { position: fixed; bottom: 20px; right: 20px; z-index: 95; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 100px; background: rgba(255,255,255,0.55); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); border: 1px solid rgba(255,255,255,0.45); box-shadow: 0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .portfolio-root .p-lang-pill button { background: transparent; border: 0; padding: 2px 4px; font-family: inherit; font-size: 0.78rem; font-weight: 500; letter-spacing: 1px; color: var(--p-fg); opacity: 0.55; cursor: pointer; transition: opacity .2s ease, color .2s ease, transform .2s ease; }
  .portfolio-root .p-lang-pill button:hover { opacity: 0.85; }
  .portfolio-root .p-lang-pill button.active { opacity: 1; color: var(--p-accent); font-weight: 700; }
  .portfolio-root .p-lang-pill .p-lang-sep { color: var(--p-fg); opacity: 0.25; font-size: 0.78rem; user-select: none; }
  .portfolio-root .p-lang-mobile { display: none; }

  /* ----- Project detail page ----- */
  .portfolio-root .p-pd-hero { padding: 140px 40px 60px; background: var(--p-hero); color: #fff; }
  .portfolio-root .p-pd-back { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.9rem; font-weight: 500; margin-bottom: 24px; }
  .portfolio-root .p-pd-back:hover { color: #fff; }
  .portfolio-root .p-pd-head { display: flex; align-items: center; gap: 20px; margin-bottom: 18px; }
  .portfolio-root .p-pd-icon { width: 64px; height: 64px; border-radius: 16px; object-fit: cover; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); }
  .portfolio-root .p-pd-title { font-family: var(--p-font); font-weight: 800; font-size: clamp(2.2rem, 5vw, 3.6rem); letter-spacing: -1.5px; line-height: 1.05; color: #fff; margin: 0; }
  .portfolio-root .p-pd-sub { font-size: 1.15rem; color: rgba(255,255,255,0.88); max-width: 640px; line-height: 1.55; margin: 6px 0 18px; }
  .portfolio-root .p-pd-meta { display: flex; flex-wrap: wrap; gap: 8px 16px; color: rgba(255,255,255,0.85); font-size: 0.92rem; margin-bottom: 24px; }
  .portfolio-root .p-pd-meta span + span::before { content: '·'; margin-right: 16px; opacity: 0.6; }
  .portfolio-root .p-pd-cover { padding: 40px 40px 0; }
  .portfolio-root .p-pd-cover img { width: 100%; max-width: 1100px; margin: 0 auto; display: block; border-radius: calc(var(--p-radius) + 8px); object-fit: cover; box-shadow: 0 20px 60px rgba(0,0,0,0.18); aspect-ratio: 16 / 9; }
  .portfolio-root .p-pd-overview { display: grid; grid-template-columns: 1.6fr 1fr; gap: 40px; }
  .portfolio-root .p-pd-prose p { font-size: 1.05rem; line-height: 1.75; color: #444; margin-bottom: 16px; }
  .portfolio-root .p-pd-side h4 { font-size: 0.78rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--p-muted); margin: 0 0 12px; }
  .portfolio-root .p-pd-tech { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .portfolio-root .p-pd-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
  .portfolio-root .p-pd-metric { background: #fff; border: 1px solid var(--p-border); border-radius: var(--p-radius); padding: 22px; }
  .portfolio-root .p-pd-metric-value { font-family: var(--p-font); font-weight: 800; font-size: 2rem; color: var(--p-accent); letter-spacing: -1px; line-height: 1; margin-bottom: 6px; }
  .portfolio-root .p-pd-metric-label { font-size: 0.85rem; color: var(--p-muted); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .portfolio-root .p-pd-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .portfolio-root .p-pd-gallery figure { margin: 0; }
  .portfolio-root .p-pd-gallery img { width: 100%; height: 220px; object-fit: cover; border-radius: var(--p-radius); display: block; }
  .portfolio-root .p-pd-gallery figcaption { font-size: 0.82rem; color: var(--p-muted); margin-top: 8px; }
  .portfolio-root .p-pd-cs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; margin-bottom: 36px; }
  .portfolio-root .p-pd-cs-row.flip { direction: rtl; }
  .portfolio-root .p-pd-cs-row.flip > * { direction: ltr; }
  .portfolio-root .p-pd-cs-row img { width: 100%; border-radius: var(--p-radius); object-fit: cover; }
  .portfolio-root .p-pd-cs-row h3 { font-family: var(--p-font); font-size: 1.4rem; font-weight: 700; margin: 0 0 12px; }
  .portfolio-root .p-pd-cs-row p { font-size: 1rem; color: #444; line-height: 1.7; white-space: pre-wrap; }
  .portfolio-root .p-pd-link-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: var(--p-radius); background: #fff; color: var(--p-accent); font-weight: 700; text-decoration: none; font-size: 0.92rem; box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
  .portfolio-root .p-pd-link-btn:hover { transform: translateY(-2px); }
  .portfolio-root .p-pd-link-btn.ghost { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.6); }
  .portfolio-root .p-pd-live-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ef4444; animation: p-pd-live-blink 1.2s ease-in-out infinite; vertical-align: middle; }
  @keyframes p-pd-live-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
  .portfolio-root .p-pd-status { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--p-radius); background: rgba(255,255,255,0.18); color: #fff; font-weight: 700; font-size: 0.92rem; backdrop-filter: blur(4px); }
  .portfolio-root .p-pd-link-row { display: flex; flex-wrap: wrap; gap: 12px; }

  @media (max-width: 800px) {
    .portfolio-root .p-hero-grid.has-image { grid-template-columns: 1fr; }
    .portfolio-root .p-hero-photo { max-width: 240px; }
    .portfolio-root .p-pd-overview { grid-template-columns: 1fr; }
    .portfolio-root .p-pd-cs-row { grid-template-columns: 1fr; direction: ltr; }
  }
  @media (max-width: 700px) {
    .portfolio-root nav.p-nav { width: calc(100% - 24px); padding: 10px 16px; top: 12px; }
    .portfolio-root .p-nav-links { display: none; }
    .portfolio-root .p-nav-burger { display: inline-flex; }
    .portfolio-root .p-section { padding: 60px 20px; }
    .portfolio-root .p-title { font-size: clamp(1.7rem, 7vw, 2.2rem); margin-bottom: 28px; }
    .portfolio-root .p-hero { padding: 100px 20px 60px; min-height: auto; }
    .portfolio-root .p-hero-grid,
    .portfolio-root .p-hero-grid.has-image { grid-template-columns: 1fr !important; gap: 28px; }
    .portfolio-root .p-hero-title { font-size: clamp(2.4rem, 10vw, 3.2rem); letter-spacing: -1px; }
    .portfolio-root .p-hero-sub { font-size: 1.05rem; margin-bottom: 28px; }
    .portfolio-root .p-hero-photo { max-width: 220px !important; }
    .portfolio-root .p-btns { flex-direction: column; align-items: stretch; gap: 12px; width: 100%; }
    .portfolio-root .p-btns > a { width: 100%; padding: 12px 20px; }
    .portfolio-root .p-about-grid { grid-template-columns: 1fr !important; gap: 32px; }
    .portfolio-root .p-about-portrait { max-width: 280px !important; margin: 0 auto; display: block; }
    .portfolio-root .p-about-text p { font-size: 1rem; }
    .portfolio-root .p-projects { grid-template-columns: 1fr; gap: 18px; }
    .portfolio-root .p-card { min-width: 0; }
    .portfolio-root .p-timeline { padding-left: 22px; }
    .portfolio-root .p-tl-dot { left: -22px; }
    .portfolio-root .p-tl-role { font-size: 1.05rem; }
    .portfolio-root .p-contact-grid { grid-template-columns: 1fr; }
    .portfolio-root .p-stat-label, .portfolio-root .p-lang-row { font-size: 0.88rem; }
    .portfolio-root .p-logos-section { padding: 40px 20px; }
    .portfolio-root .p-logos-row { gap: 28px; }
    .portfolio-root .p-logo-item img { max-height: 40px; max-width: 100px; }
    .portfolio-root .p-footer { padding: 28px 20px; }
    .portfolio-root .p-lang-pill { display: none; }
    .portfolio-root .p-lang-mobile { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 14px 0 4px; margin-top: 8px; border-top: 1px solid var(--p-border); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .portfolio-root .p-lang-mobile button { background: transparent; border: 0; padding: 4px 6px; font-family: inherit; font-size: 0.72rem; letter-spacing: 1px; font-weight: 500; color: var(--p-fg); opacity: 0.55; cursor: pointer; transition: opacity .2s ease, color .2s ease; }
    .portfolio-root .p-lang-mobile button.active { opacity: 1; color: var(--p-accent); font-weight: 700; }
    .portfolio-root .p-lang-mobile .p-lang-sep { color: var(--p-fg); opacity: 0.25; font-size: 0.72rem; }
    .portfolio-root .p-pd-hero { padding: 100px 20px 40px; }
    .portfolio-root .p-pd-cover { padding: 24px 20px 0; }
    .portfolio-root .p-pd-head { gap: 14px; }
    .portfolio-root .p-pd-icon { width: 52px; height: 52px; }
    .portfolio-root .p-pd-gallery img { height: 180px; }
  }
  @media (max-width: 420px) {
    .portfolio-root nav.p-nav { padding: 8px 14px; }
    .portfolio-root .p-section { padding: 50px 16px; }
    .portfolio-root .p-hero { padding: 90px 16px 50px; }
    .portfolio-root .p-hero-title { font-size: clamp(2rem, 11vw, 2.8rem); }
    .portfolio-root .p-hero-photo { max-width: 180px !important; }
    .portfolio-root .p-title { font-size: 1.6rem; margin-bottom: 22px; }
  }
`;

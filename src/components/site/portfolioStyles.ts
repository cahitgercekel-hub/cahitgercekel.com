// Shared CSS for the portfolio site (used by both Index and ProjectDetail pages).
// Keep .portfolio-root scoped so styles never leak to the admin app.

export const PORTFOLIO_CSS = `
  html { scroll-behavior: smooth; }
  .portfolio-root section[id] { scroll-margin-top: 96px; }
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
  .portfolio-root nav.p-nav.compact .p-logo-word + .p-logo-word,
  .portfolio-root nav.p-nav.fit-short .p-logo-word + .p-logo-word { margin-left: 0; }
  .portfolio-root nav.p-nav.compact .p-logo-rest,
  .portfolio-root nav.p-nav.fit-short .p-logo-rest { max-width: 0; opacity: 0; transform: translateX(8px); }
  /* Disable transitions while measuring whether the links fit (see SiteChrome) */
  .portfolio-root nav.p-nav.fit-measure, .portfolio-root nav.p-nav.fit-measure * { transition: none !important; }
  .portfolio-root nav.p-nav.fit-burger .p-nav-links { position: absolute; visibility: hidden; pointer-events: none; }
  .portfolio-root nav.p-nav.fit-burger .p-nav-burger { display: inline-flex; }
  .portfolio-root .p-logo-dot { color: #db0000; }
  .portfolio-root .p-nav-links { display: flex; flex-shrink: 0; gap: 12px; list-style: none; margin:0; padding:0; }
  /* Padding enlarges the click/tap area around the text; the negative margin keeps the nav height unchanged */
  .portfolio-root .p-nav-links a { display: inline-block; padding: 10px 8px; margin: -10px 0; white-space: nowrap; border-radius: 8px; text-decoration: none; color: var(--p-fg); font-size: 0.9rem; font-weight: 500; }
  .portfolio-root .p-nav-links a:hover { color: var(--p-accent); }
  .portfolio-root .p-nav-links a.active { color: var(--p-accent); font-weight: 700; }
  .portfolio-root .p-nav-links li.p-nav-sep { padding-left: 12px; border-left: 1px solid var(--p-border); }
  .portfolio-root .p-mobile-menu li a.active { color: var(--p-accent); font-weight: 700; }
  .portfolio-root .p-mobile-menu li.p-nav-sep { margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--p-border); }
  .portfolio-root .p-section { padding: 100px 20px; }
  .portfolio-root .p-section.alt { background: #fff; }
  .portfolio-root .p-inner { max-width: 960px; margin: 0 auto; }
  .portfolio-root .p-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--p-accent); margin-bottom: 10px; }
  .portfolio-root .p-title { font-family: var(--p-font); font-weight: 800; font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -1.5px; margin-bottom: 40px; line-height: 1.1; }
  .portfolio-root .p-hero { min-height: 100vh; display: flex; align-items: center; background: var(--p-hero); padding: 120px 40px 80px; }
  .portfolio-root .p-hero-grid { display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center; width: 100%; }
  .portfolio-root .p-hero-grid.has-image { grid-template-columns: 1.2fr 1fr; }
  .portfolio-root .p-hero-tag { display: inline-block; background: rgba(255,255,255,0.25); color: #fff; border-radius: 100px; padding: 6px 16px; font-size: 0.85rem; font-weight: 500; margin-bottom: 24px; backdrop-filter: blur(4px); }
  .portfolio-root .p-hero-title { font-family: var(--p-font); font-weight: 800; font-size: clamp(2.6rem, 5.2vw, 4rem); line-height: 1.05; color: #fff; letter-spacing: -2px; margin-bottom: 20px; }
  .portfolio-root .p-hero-title .dot { color: #db0000; }
  .portfolio-root .p-hero-title .split-parent > span:last-child > span:last-child { color: #db0000; }
  .portfolio-root .p-hero-sub { font-size: 1.25rem; color: rgba(255,255,255,0.85); max-width: 480px; line-height: 1.6; margin-bottom: 36px; }
  .portfolio-root .p-hero-photo { width: 100%; aspect-ratio: 1 / 1; max-width: 360px; justify-self: center; border-radius: calc(var(--p-radius) * 2); object-fit: cover; box-shadow: 0 20px 60px rgba(0,0,0,0.25); border: 4px solid rgba(255,255,255,0.4); }
  .portfolio-root .p-btns { display: flex; gap: 10px; flex-wrap: nowrap; align-items: stretch; max-width: 100%; }
  .portfolio-root .p-btns > a { min-height: 52px; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; min-width: 0; flex: 0 1 auto; }
  .portfolio-root .p-btn-primary { background: #fff; color: var(--p-accent); border: 2px solid #fff; border-radius: var(--p-radius); padding: 12px clamp(10px, 1.6vw, 18px); font-size: clamp(0.82rem, 1vw, 1rem); font-weight: 700; cursor: pointer; text-decoration:none; box-shadow: 0 6px 18px rgba(0,0,0,0.18); transition: transform .2s ease, box-shadow .2s ease; white-space: nowrap; }
  .portfolio-root .p-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.25); }
  .portfolio-root .p-btn-ghost { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.6); border-radius: var(--p-radius); padding: 12px clamp(10px, 1.6vw, 18px); font-size: clamp(0.82rem, 1vw, 1rem); font-weight: 600; cursor: pointer; text-decoration:none; box-shadow: 0 6px 18px rgba(0,0,0,0.15); transition: transform .2s ease, box-shadow .2s ease; white-space: nowrap; }
  .portfolio-root .p-btn-ghost:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,0.22); }
  .portfolio-root .p-btn-cv { background: var(--p-fg); color: #fff; border: 2px solid var(--p-fg); border-radius: var(--p-radius); padding: 12px clamp(10px, 1.6vw, 18px); font-size: clamp(0.82rem, 1vw, 1rem); font-weight: 700; text-decoration: none; gap: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.22); transition: transform .2s ease, box-shadow .2s ease; white-space: nowrap; }
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
  .portfolio-root .p-pill.has-icon { display: inline-flex; align-items: center; gap: 7px; padding-left: 12px; }
  .portfolio-root .p-pill-icon { width: 15px; height: 15px; flex-shrink: 0; }
  .portfolio-root .p-stat-label { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; }
  .portfolio-root .p-stat-track { background: var(--p-border); border-radius: 6px; height: 8px; overflow: hidden; margin-bottom: 18px; }
  .portfolio-root .p-stat-fill { height: 100%; border-radius: 6px; background: var(--p-accent); }
  .portfolio-root .p-lang-row { display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; }
  .portfolio-root .p-lang-level { color: var(--p-muted); font-weight: 500; font-size: 0.85rem; }
  .portfolio-root .p-projects { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
  .portfolio-root .p-card-pills { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 14px; }
  .portfolio-root .p-card-pill { display: inline-block; padding: 4px 10px; border-radius: 100px; background: rgba(0,0,0,0.06); color: var(--p-fg); font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2px; }
  .portfolio-root .p-card { position: relative; background: var(--p-bg); border-radius: calc(var(--p-radius) + 6px); overflow: hidden; border: 1px solid rgba(0,0,0,0.12); box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08); transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; display: flex; flex-direction: column; }
  .portfolio-root .p-card:hover { transform: translateY(-6px); box-shadow: 0 4px 8px rgba(0,0,0,0.06), 0 18px 40px rgba(0,0,0,0.14); border-color: rgba(0,0,0,0.18); }
  .portfolio-root .p-card.featured { border-color: var(--p-accent); box-shadow: 0 4px 10px rgba(0,0,0,0.06), 0 14px 32px hsl(from var(--p-accent) h s l / 0.25); }
  .portfolio-root a.p-card { color: inherit; text-decoration: none; }
  .portfolio-root a.p-card:hover h3 { color: var(--p-accent); }
  .portfolio-root .p-card-body { padding: 20px; display: flex; flex-direction: column; flex: 1; }
  .portfolio-root .p-card-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .portfolio-root .p-card-tag { font-size: 0.72rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--p-accent); margin-bottom: 6px; }
  .portfolio-root .p-card h3 { font-family: var(--p-font); font-size: 1.1rem; font-weight: 700; margin: 0 0 8px; transition: color .2s ease; }
  .portfolio-root .p-card p { font-size: 0.88rem; color: var(--p-muted); line-height: 1.6; margin-bottom: 16px; }
  .portfolio-root .p-card .p-card-cta { font-size: 0.85rem; font-weight: 700; color: var(--p-accent); text-decoration: none; }
  .portfolio-root .p-card-live-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 100px;
    background: #fff;
    color: #ef4444;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-decoration: none;
    border: 1px solid rgba(239, 68, 68, 0.2);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: 20;
    animation: p-card-live-entrance 0.5s cubic-bezier(0.23, 1, 0.32, 1) both;
    animation-delay: 0.2s;
  }
  @keyframes p-card-live-entrance {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .portfolio-root .p-card-live-btn:hover {
    background: #ef4444;
    color: #fff;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.25);
    border-color: #ef4444;
  }
  .portfolio-root .p-card-live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
    animation: p-card-live-blink 1.2s ease-in-out infinite;
  }
  .portfolio-root .p-card-live-btn:hover .p-card-live-dot {
    background: #fff;
  }
  @keyframes p-card-live-blink { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
  .portfolio-root .p-card-thumb { position: relative; overflow: hidden; height: 160px; display:flex; align-items:center; justify-content:center; font-size: 2.5rem; background: var(--p-accent); color:#fff; }
  .portfolio-root .p-card-thumb img { width:100%; height:100%; object-fit:cover; }
  .portfolio-root .p-card-thumb .p-card-thumb-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; filter: blur(24px) saturate(1.2); transform: scale(1.2); z-index: 0; }
  .portfolio-root .p-card-thumb .p-card-thumb-img { position: relative; z-index: 1; object-fit: cover; }
  .portfolio-root .p-timeline { position: relative; padding-left: 32px; }
  .portfolio-root .p-timeline::before { content: ''; position: absolute; left: 6px; top: 6px; bottom: 6px; width: 2px; background: var(--p-border); }
  .portfolio-root .p-tl-item { position: relative; margin-bottom: 44px; }
  .portfolio-root .p-tl-dot { position: absolute; left: -32px; top: 5px; width: 14px; height: 14px; border-radius: 50%; background: var(--p-accent); border: 2px solid #fff; box-shadow: 0 0 0 3px var(--p-accent); }
  .portfolio-root .p-tl-period { font-size: 0.78rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--p-muted); margin-bottom: 4px; }
  .portfolio-root .p-tl-role { font-family: var(--p-font); font-size: 1.15rem; font-weight: 700; }
  .portfolio-root .p-tl-company { font-size: 0.95rem; color: var(--p-accent); font-weight: 600; text-decoration: none; }
  .portfolio-root a.p-tl-company:hover { text-decoration: underline; }
  .portfolio-root .p-tl-company-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
  .portfolio-root .p-tl-company-text { display: flex; flex-direction: column; gap: 2px; }
  .portfolio-root .p-tl-logo { width: 64px; height: 64px; border-radius: 10px; object-fit: contain; background: #fff; border: 1px solid var(--p-border); padding: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); flex-shrink: 0; }
  .portfolio-root .p-tl-location { font-size: 0.85rem; color: var(--p-muted); display: inline-flex; align-items: center; gap: 4px; }
  .portfolio-root .p-tl-location::before { content: '📍'; font-size: 0.85rem; }
  .portfolio-root .p-tl-desc { font-size: 0.92rem; color: #555; line-height: 1.65; }
  .portfolio-root .p-contact-info p { font-size: 1.05rem; color: #555; line-height: 1.7; margin-bottom: 24px; }
  .portfolio-root .p-contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; }
  .portfolio-root .p-contact-link { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--p-fg); font-weight: 500; padding: 14px 18px; border-radius: var(--p-radius); border: 1px solid var(--p-border); background: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.06); transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease, background .25s ease; }
  .portfolio-root .p-contact-link:hover { transform: translateY(-4px); background: var(--p-bg); border-color: var(--p-accent); box-shadow: 0 12px 28px rgba(0,0,0,0.14); }
  .portfolio-root .p-contact-icon { width: 22px; height: 22px; object-fit: contain; }
  .portfolio-root button.p-contact-email { font: inherit; text-align: left; cursor: pointer; width: 100%; min-width: 0; }
  .portfolio-root .p-contact-email-addr { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .portfolio-root .p-contact-copy { flex-shrink: 0; font-size: 0.8rem; font-weight: 600; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--p-border); color: var(--p-muted); transition: color .2s ease, border-color .2s ease, background .2s ease; }
  .portfolio-root .p-contact-email:hover .p-contact-copy { color: var(--p-fg); border-color: var(--p-fg); }
  .portfolio-root .p-contact-copy.copied { color: #0a7a3e; border-color: #0a7a3e; background: rgba(10,122,62,0.08); }
  @media (min-width: 701px) { .portfolio-root .p-contact-email { grid-column: span 2; } }
  .portfolio-root .p-logos-section { padding: 60px 40px; }
  .portfolio-root .p-logos-label { font-size: 0.85rem; font-weight: 500; letter-spacing: 2px; color: var(--p-muted); text-align: center; margin-bottom: 28px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .portfolio-root .p-logos-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 48px; }
  .portfolio-root .p-logo-item { display: inline-flex; align-items: center; justify-content: center; filter: grayscale(100%); opacity: 0.55; transition: filter .35s ease, opacity .35s ease, transform .35s ease; }
  .portfolio-root .p-logo-item:hover { filter: grayscale(0%); opacity: 1; transform: translateY(-2px); }
  .portfolio-root .p-logo-item img { max-height: 56px; max-width: 140px; width: auto; height: auto; object-fit: contain; display: block; }
  .portfolio-root .p-footer { background: var(--p-fg); color: rgba(255,255,255,0.7); padding: 40px; font-size: 0.88rem; }
  .portfolio-root .p-footer-inner { position: relative; display: flex; align-items: center; justify-content: flex-start; gap: 20px; text-align: left; }
  .portfolio-root .p-footer-inner > p { margin: 0; }
  .portfolio-root .p-footer-to-top { display: none; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: transparent; border: 0; padding: 0; color: #fff; font-weight: 600; cursor: pointer; opacity: 0.6; transition: opacity .2s ease; }
  .portfolio-root .p-footer-to-top:hover { opacity: 1; }
  @media (min-width: 701px) { .portfolio-root .p-footer-to-top { display: block; } }
  @media (max-width: 700px) { .portfolio-root .p-footer-inner { flex-direction: column; text-align: center; } .portfolio-root .p-footer-to-top { position: static; transform: none; } }
  .portfolio-root .p-lang-pill { position: fixed; bottom: 20px; right: 20px; z-index: 95; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 100px; background: rgba(255,255,255,0.55); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); border: 1px solid rgba(255,255,255,0.45); box-shadow: 0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .portfolio-root .p-lang-pill button, .portfolio-root .p-lang-pill a { text-decoration: none; background: transparent; border: 0; padding: 2px 4px; font-family: inherit; font-size: 0.78rem; font-weight: 500; letter-spacing: 1px; color: var(--p-fg); opacity: 0.55; cursor: pointer; transition: opacity .2s ease, color .2s ease, transform .2s ease; }
  .portfolio-root .p-lang-pill button:hover, .portfolio-root .p-lang-pill a:hover { opacity: 0.85; }
  .portfolio-root .p-lang-pill button.active, .portfolio-root .p-lang-pill a.active { opacity: 1; color: var(--p-fg); font-weight: 800; }
  .portfolio-root .p-lang-pill .p-lang-sep { color: var(--p-fg); opacity: 0.25; font-size: 0.78rem; user-select: none; }
  .portfolio-root .p-to-top { display: none; position: fixed; bottom: 20px; right: 20px; z-index: 96; width: 44px; height: 44px; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid rgba(255,255,255,0.45); background: rgba(255,255,255,0.6); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); color: var(--p-fg); box-shadow: 0 6px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6); cursor: pointer; opacity: 0; pointer-events: none; transform: translateY(8px); transition: opacity .25s ease, transform .25s ease; }
  .portfolio-root .p-to-top.visible { opacity: 1; pointer-events: auto; transform: translateY(0); }
  .portfolio-root .p-to-top:active { transform: scale(0.94); }
  .portfolio-root .p-lang-mobile { display: none; }

  /* ----- Project detail page ----- */
  .portfolio-root .p-pd-hero { padding: 120px 40px 50px; background: var(--p-hero); color: #fff; }
  .portfolio-root .p-pd-back { display: inline-flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.9rem; font-weight: 500; margin-bottom: 20px; }
  .portfolio-root .p-pd-back:hover { color: #fff; }
  .portfolio-root .p-pd-head { display: flex; align-items: center; gap: 20px; margin-bottom: 14px; width: 100%; }
  .portfolio-root .p-pd-head-btn { flex-shrink: 0; }
  .portfolio-root .p-pd-icon { width: 64px; height: 64px; border-radius: 16px; object-fit: cover; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); }
  .portfolio-root .p-pd-title { font-family: var(--p-font); font-weight: 800; font-size: clamp(2.2rem, 5vw, 3.6rem); letter-spacing: -1.5px; line-height: 1.05; color: #fff; margin: 0; }
  .portfolio-root .p-pd-tag-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .portfolio-root .p-pd-tag-row .p-hero-tag { margin-bottom: 0; }
  .portfolio-root .p-pd-year-tag { margin-left: auto; display: inline-block; background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); border-radius: 100px; padding: 6px 16px; font-size: 0.85rem; font-weight: 600; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2); }
  .portfolio-root .p-pd-sub { font-size: 1.15rem; color: rgba(255,255,255,0.88); max-width: 640px; line-height: 1.55; margin: 4px 0 14px; }
  .portfolio-root .p-pd-meta { display: flex; flex-wrap: wrap; gap: 8px 16px; color: rgba(255,255,255,0.85); font-size: 0.92rem; margin-bottom: 10px; }
  .portfolio-root .p-pd-meta span + span::before { content: '·'; margin-right: 16px; opacity: 0.6; }
  .portfolio-root .p-pd-hero-tech { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: flex-start; margin-bottom: 20px; }
  .portfolio-root .p-pd-hero-tech .p-pill { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9); font-size: 0.78rem; padding: 6px 14px; }
  .portfolio-root .p-pd-hero-tech .p-pill.has-icon { padding-left: 5px; gap: 7px; }
  .portfolio-root .p-pd-hero-tech .p-pill-icon { width: 20px; height: 20px; padding: 3px; box-sizing: border-box; border-radius: 50%; background: #fff; }
  .portfolio-root .p-pd-cover { padding: 40px 40px 0; }
  .portfolio-root .p-pd-cover img { width: 100%; max-width: 1100px; margin: 0 auto; display: block; border-radius: calc(var(--p-radius) + 8px); object-fit: cover; box-shadow: 0 20px 60px rgba(0,0,0,0.18); aspect-ratio: 16 / 9; }
  .portfolio-root .p-pd-hero-footer { margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); padding: 24px 0 0; }
  .portfolio-root .p-pd-link-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
  .portfolio-root .p-pd-overview { display: block; }
  .portfolio-root .p-pd-overview.full-width { max-width: 800px; margin: 0 auto; }
  .portfolio-root .p-pd-prose p { font-size: 1.1rem; line-height: 1.8; color: #444; margin-bottom: 20px; }
  .portfolio-root .p-pd-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
  .portfolio-root .p-pd-metric { background: #fff; border: 1px solid var(--p-border); border-radius: var(--p-radius); padding: 22px; }
  .portfolio-root .p-pd-metric-value { font-family: var(--p-font); font-weight: 800; font-size: 2rem; color: var(--p-accent); letter-spacing: -1px; line-height: 1; margin-bottom: 6px; }
  .portfolio-root .p-pd-metric-label { font-size: 0.85rem; color: var(--p-muted); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .portfolio-root .p-pd-gallery { --g-row: 230px; display: flex; flex-wrap: wrap; gap: 16px; }
  .portfolio-root .p-pd-gallery::after { content: ""; flex-grow: 1000000; }
  .portfolio-root .p-pd-gallery figure { margin: 0; min-width: 0; cursor: pointer; overflow: hidden; border-radius: var(--p-radius); background: #fff; border: 1px solid var(--p-border); display: flex; flex-direction: column; transition: transform .3s ease, box-shadow .3s ease; }
  .portfolio-root .p-pd-gallery figure:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
  .portfolio-root .p-pd-gallery-media { width: 100%; overflow: hidden; background: rgba(0,0,0,0.04); }
  .portfolio-root .p-pd-gallery-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s ease; }
  .portfolio-root .p-pd-gallery-media.fit img { object-fit: contain; }
  .portfolio-root .p-pd-gallery figure:hover .p-pd-gallery-media img { transform: scale(1.02); }
  .portfolio-root .p-pd-gallery figcaption { flex: 1; padding: 10px 12px 12px; text-align: left; font-size: 0.82rem; line-height: 1.35; min-height: calc(2.7em + 22px); box-sizing: border-box; }
  .portfolio-root .p-pd-gallery-title { display: block; overflow-wrap: break-word; hyphens: auto; font-size: 1em; font-weight: 600; color: var(--p-fg); }
  .portfolio-root .p-pd-gallery-caption { display: block; margin-top: 2px; font-size: 0.95em; color: var(--p-muted); }
  .portfolio-root .p-pd-docs { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 16px; }
  .portfolio-root .p-pd-doc { display: flex; gap: 16px; align-items: flex-start; min-width: 0; padding: 14px; border-radius: calc(var(--p-radius) + 4px); border: 1px solid var(--p-border); background: #fff; transition: box-shadow .25s ease, transform .25s ease; }
  .portfolio-root .p-pd-doc:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,0.07); }
  .portfolio-root .p-pd-doc-thumb { flex: none; width: 104px; height: auto; aspect-ratio: 210 / 297; box-sizing: border-box; border-radius: 6px; overflow: hidden; border: 1px solid var(--p-border); background: #f4f4f4; display: grid; place-items: center; text-decoration: none; }
  .portfolio-root .p-pd-doc-thumb img { width: 100%; height: 100%; object-fit: contain; background: #fff; display: block; }
  .portfolio-root .p-pd-doc-thumb span { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.75rem; font-weight: 700; color: #c62828; letter-spacing: 1px; }
  .portfolio-root .p-pd-doc-body { flex: 1; min-width: 0; align-self: stretch; display: flex; flex-direction: column; gap: 4px; }
  .portfolio-root .p-pd-doc-body h3 { margin: 0; font-family: var(--p-font); font-size: 1rem; font-weight: 700; line-height: 1.3; overflow-wrap: anywhere; hyphens: auto; }
  .portfolio-root .p-pd-doc-body p { margin: 0; font-size: 0.85rem; line-height: 1.45; color: var(--p-muted); overflow-wrap: break-word; hyphens: auto; }
  .portfolio-root .p-pd-doc-meta { overflow-wrap: anywhere; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.7rem; letter-spacing: 1px; text-transform: uppercase; color: var(--p-muted); }
  .portfolio-root .p-pd-doc-actions { margin-top: auto; padding-top: 8px; display: flex; flex-wrap: wrap; gap: 8px; }
  .portfolio-root .p-pd-doc-actions a { display: inline-flex; align-items: center; white-space: nowrap; padding: 6px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; text-decoration: none; border: 1px solid var(--p-border); color: var(--p-fg); }
  .portfolio-root .p-pd-doc-actions a.primary { background: var(--p-fg); border-color: var(--p-fg); color: var(--p-bg); }
  .portfolio-root .p-pd-doc-actions a:hover { opacity: .85; }

  /* Lightbox */
  .portfolio-root .p-pd-lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.88);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    cursor: pointer; /* Acts as close trigger */
    animation: p-lightbox-fade .3s ease forwards;
  }
  @keyframes p-lightbox-fade { from { opacity: 0; } to { opacity: 1; } }
  .portfolio-root .p-pd-lightbox-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255,255,255,0.1);
    border: 0;
    color: #fff;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: all .2s ease;
    z-index: 2010;
  }
  .portfolio-root .p-pd-lightbox-close:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }
  .portfolio-root .p-pd-lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.1);
    border: 0;
    color: #fff;
    width: 54px;
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: all .2s ease;
    z-index: 2010;
  }
  .portfolio-root .p-pd-lightbox-nav:hover { background: rgba(255,255,255,0.2); transform: translateY(-50%) scale(1.1); }
  .portfolio-root .p-pd-lightbox-nav.prev { left: 20px; }
  .portfolio-root .p-pd-lightbox-nav.next { right: 20px; }
  .portfolio-root .p-pd-lightbox-content {
    width: 100%;
    height: 100%;
    max-width: 90vw;
    max-height: 85vh;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    animation: p-lightbox-zoom .35s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    position: relative;
  }
  @keyframes p-lightbox-zoom { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .portfolio-root .p-pd-lightbox-content img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
  .portfolio-root .p-pd-cs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; margin-bottom: 36px; }
  .portfolio-root .p-pd-cs-row.flip { direction: rtl; }
  .portfolio-root .p-pd-cs-row.flip > * { direction: ltr; }
  .portfolio-root .p-pd-cs-row img { width: 100%; border-radius: var(--p-radius); object-fit: cover; }
  .portfolio-root .p-pd-cs-row h3 { font-family: var(--p-font); font-size: 1.4rem; font-weight: 700; margin: 0 0 12px; }
  .portfolio-root .p-pd-cs-row p { font-size: 1rem; color: #444; line-height: 1.7; white-space: pre-wrap; }
  .portfolio-root .p-pd-link-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: var(--p-radius); background: #fff; color: var(--p-accent); font-weight: 700; text-decoration: none; font-size: 0.92rem; box-shadow: 0 6px 18px rgba(0,0,0,0.18); }
  .portfolio-root .p-pd-link-btn:hover { transform: translateY(-2px); }
  .portfolio-root .p-pd-link-btn.ghost { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.6); }
  .portfolio-root .p-pd-live-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ef4444; animation: p-pd-live-blink 1.2s ease-in-out infinite; margin-bottom: 1px; }
  @keyframes p-pd-live-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
  .portfolio-root .p-pd-status { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: var(--p-radius); background: rgba(255,255,255,0.18); color: #fff; font-weight: 700; font-size: 0.92rem; backdrop-filter: blur(4px); }
  .portfolio-root .p-pd-link-row { display: flex; flex-wrap: wrap; gap: 12px; }

  /* Description blocks */
  .portfolio-root .p-pd-desc-block { margin-bottom: 64px; display: flex; flex-direction: column; gap: 32px; }
  .portfolio-root .p-pd-desc-block.under { flex-direction: column; }
  .portfolio-root .p-pd-desc-block.side-left { flex-direction: row-reverse; align-items: stretch; gap: 48px; }
  .portfolio-root .p-pd-desc-block.side-right { flex-direction: row; align-items: stretch; gap: 48px; }
  .portfolio-root .p-pd-desc-text { flex: 1; min-width: 0; }
  
  /* Side layout image sizing */
  .portfolio-root .p-pd-desc-block.side-left { flex-direction: row-reverse; align-items: flex-start; gap: 48px; }
  .portfolio-root .p-pd-desc-block.side-right { flex-direction: row; align-items: flex-start; gap: 48px; }
  .portfolio-root .p-pd-desc-block.side-left .p-pd-desc-img,
  .portfolio-root .p-pd-desc-block.side-right .p-pd-desc-img {
    flex: 0 1 auto;
    min-height: 240px;
    max-height: 520px;
    width: fit-content;
  }
  .portfolio-root .p-pd-desc-block.side-left .p-pd-desc-img img,
  .portfolio-root .p-pd-desc-block.side-right .p-pd-desc-img img {
    height: 100%;
    width: auto;
    max-width: 100%;
    object-fit: contain;
  }

  /* Under layout image sizing */
  .portfolio-root .p-pd-desc-block.under .p-pd-desc-img {
    width: fit-content;
    max-width: 100%;
    align-self: center;
  }
  .portfolio-root .p-pd-desc-block.under .p-pd-desc-img img {
    height: auto;
    width: auto;
    max-width: 100%;
    max-height: 560px;
  }

  .portfolio-root .p-pd-desc-img { 
    position: relative; 
    cursor: pointer; 
    border-radius: var(--p-radius); 
    overflow: hidden; 
    display: flex;
    flex-direction: column;
    border: 1px solid var(--p-border);
    transition: transform .3s ease, box-shadow .3s ease;
  }
  .portfolio-root .p-pd-desc-img img { 
    display: block; 
  }
  .portfolio-root .p-pd-desc-img:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
  .portfolio-root .p-pd-desc-caption { 
    display: block; 
    padding: 10px 14px; 
    font-size: 0.85rem; 
    color: var(--p-muted); 
    flex-shrink: 0;
    background: rgba(0,0,0,0.02);
    border-top: 1px solid var(--p-border);
  }

  @media (max-width: 800px) {
    .portfolio-root .p-hero-grid.has-image { grid-template-columns: 1fr; }
    .portfolio-root .p-hero-photo { max-width: 240px; }
    .portfolio-root .p-pd-overview { grid-template-columns: 1fr; }
    .portfolio-root .p-pd-cs-row { grid-template-columns: 1fr; direction: ltr; }
    .portfolio-root .p-pd-desc-block.side-left,
    .portfolio-root .p-pd-desc-block.side-right { flex-direction: column; align-items: stretch; gap: 24px; }
    .portfolio-root .p-pd-desc-block.side-left .p-pd-desc-img,
    .portfolio-root .p-pd-desc-block.side-right .p-pd-desc-img { flex: none; width: fit-content; max-width: 100%; max-height: 440px; min-height: 200px; align-self: center; }
    .portfolio-root .p-pd-desc-block.side-left .p-pd-desc-img img,
    .portfolio-root .p-pd-desc-block.side-right .p-pd-desc-img img { height: auto; max-height: 400px; }
  }
  @media (max-width: 700px) {
    .portfolio-root nav.p-nav { width: calc(100% - 24px); padding: 10px 16px; top: 12px; }
    .portfolio-root .p-nav-links { display: none; }
    .portfolio-root .p-nav-burger { display: inline-flex; }
    .portfolio-root .p-section { padding: 60px 12px; }
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
    .portfolio-root .p-card-thumb { height: auto; aspect-ratio: 16 / 10; }
    .portfolio-root .p-card-thumb .p-card-thumb-img { width: 100%; height: 100%; object-fit: contain; background: transparent; }
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
    .portfolio-root .p-to-top { display: flex; }
    .portfolio-root .p-lang-mobile { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 14px 0 4px; margin-top: 8px; border-top: 1px solid var(--p-border); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .portfolio-root .p-lang-mobile button, .portfolio-root .p-lang-mobile a { text-decoration: none; background: transparent; border: 0; padding: 4px 6px; font-family: inherit; font-size: 0.72rem; letter-spacing: 1px; font-weight: 500; color: var(--p-fg); opacity: 0.55; cursor: pointer; transition: opacity .2s ease, color .2s ease; }
    .portfolio-root .p-lang-mobile button.active, .portfolio-root .p-lang-mobile a.active { opacity: 1; color: var(--p-fg); font-weight: 800; }
    .portfolio-root .p-lang-mobile .p-lang-sep { color: var(--p-fg); opacity: 0.25; font-size: 0.72rem; }
    .portfolio-root .p-pd-hero { padding: 100px 20px 40px; }
    .portfolio-root .p-pd-cover { padding: 24px 20px 0; }
    .portfolio-root .p-pd-head { gap: 14px; flex-wrap: wrap; row-gap: 12px; }
    .portfolio-root .p-pd-title { overflow-wrap: anywhere; }
    .portfolio-root .p-pd-icon { width: 52px; height: 52px; }
    .portfolio-root .p-pd-gallery { --g-row: 170px; gap: 10px; }
    .portfolio-root .p-pd-gallery figcaption { padding: 8px 10px 10px; font-size: 0.78rem; }
    .portfolio-root .p-pd-doc { gap: 12px; padding: 12px; }
    .portfolio-root .p-pd-doc-thumb { width: 84px; }
  }
  @media (max-width: 420px) {
    .portfolio-root nav.p-nav { padding: 8px 14px; }
    .portfolio-root .p-section { padding: 50px 10px; }
    .portfolio-root .p-hero { padding: 90px 16px 50px; }
    .portfolio-root .p-hero-title { font-size: clamp(2rem, 11vw, 2.8rem); }
    .portfolio-root .p-hero-photo { max-width: 180px !important; }
    .portfolio-root .p-title { font-size: 1.6rem; margin-bottom: 22px; }
  }

  /* 3D exploded view (Exploded3D.tsx): a tall section with a sticky stage; scrolling drives the animation.
     Desktop: model on the left, a panel with the part card and the numbered part list on the right.
     Mobile: model on top, the card and a horizontally scrolling strip of parts below it. */
  .portfolio-root .p-x3d { position: relative; height: 560vh; }
  .portfolio-root .p-x3d-sticky { box-sizing: border-box; position: sticky; top: 0; height: 100vh; height: 100dvh; display: grid; grid-template-rows: auto minmax(0, 1fr); gap: 12px; padding: 92px 20px 24px; overflow: hidden; }
  .portfolio-root .p-x3d-head { width: 100%; max-width: 1200px; margin: 0 auto; }
  .portfolio-root .p-x3d-head .p-label { margin-bottom: 6px; }
  .portfolio-root .p-x3d-head .p-title { margin-bottom: 4px; }
  .portfolio-root .p-x3d-hint { margin: 0; color: var(--p-muted); font-size: 0.9rem; }
  .portfolio-root .p-x3d-body { width: 100%; max-width: 1200px; margin: 0 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 24px; }
  .portfolio-root .p-x3d-body > * { min-width: 0; }
  .portfolio-root .p-x3d-stage { position: relative; min-height: 0; border-radius: calc(var(--p-radius) + 8px); background: radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.75), rgba(255,255,255,0) 70%); }
  .portfolio-root .p-x3d-stage canvas { position: absolute; inset: 0; width: 100% !important; height: 100% !important; display: block; touch-action: pan-y; }
  .portfolio-root .p-x3d-fallback { position: absolute; inset: 0; display: grid; place-items: center; color: var(--p-muted); font-size: 0.85rem; text-align: center; }
  .portfolio-root .p-x3d-pin { position: absolute; left: 0; top: 0; width: 0; height: 0; pointer-events: none; transition: opacity .3s ease; }
  .portfolio-root .p-x3d-pin i { position: absolute; left: -9px; top: -9px; width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--p-accent); background: color-mix(in srgb, var(--p-accent) 22%, transparent); box-shadow: 0 0 0 6px color-mix(in srgb, var(--p-accent) 12%, transparent); }
  .portfolio-root .p-x3d-panel { min-height: 0; display: flex; flex-direction: column; gap: 10px; align-self: center; max-height: 100%; }
  .portfolio-root .p-x3d-card { position: relative; flex: none; padding: 16px 18px 18px; border-radius: calc(var(--p-radius) + 4px); border: 1px solid var(--p-border); background: color-mix(in srgb, var(--p-bg) 88%, white); box-shadow: 0 6px 24px rgba(0,0,0,0.06); overflow: hidden; }
  .portfolio-root .p-x3d-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 22px; }
  .portfolio-root .p-x3d-n { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.72rem; letter-spacing: 2px; text-transform: uppercase; color: var(--p-accent); }
  .portfolio-root .p-x3d-reset { border: 0; background: transparent; padding: 2px 0; font: inherit; font-size: 0.78rem; font-weight: 600; color: var(--p-muted); cursor: pointer; }
  .portfolio-root .p-x3d-reset:hover { color: var(--p-accent); }
  .portfolio-root .p-x3d-card h3 { margin: 6px 0 0; font-family: var(--p-font); font-weight: 800; font-size: 1.15rem; line-height: 1.25; }
  .portfolio-root .p-x3d-card p { margin: 6px 0 0; color: var(--p-muted); font-size: 0.92rem; line-height: 1.5; min-height: 2.8em; }
  .portfolio-root .p-x3d-progress { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: color-mix(in srgb, var(--p-accent) 12%, transparent); }
  .portfolio-root .p-x3d-progress span { display: block; height: 100%; background: var(--p-accent); transform-origin: left center; transform: scaleX(0); }
  .portfolio-root .p-x3d-parts { list-style: none; margin: 0; padding: 0; min-height: 0; overflow-y: auto; overflow-x: hidden; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 4px; }
  .portfolio-root .p-x3d-parts li { min-width: 0; }
  .portfolio-root .p-x3d-parts button { width: 100%; min-width: 0; display: flex; align-items: center; gap: 8px; padding: 5px 8px; border: 0; border-radius: 10px; background: transparent; font: inherit; text-align: left; color: var(--p-fg); cursor: pointer; transition: background .2s ease, color .2s ease; }
  .portfolio-root .p-x3d-parts button:hover { background: color-mix(in srgb, var(--p-accent) 8%, transparent); }
  .portfolio-root .p-x3d-parts button:focus-visible { outline: 2px solid var(--p-accent); outline-offset: 1px; }
  .portfolio-root .p-x3d-num { flex: none; width: 26px; height: 26px; display: inline-grid; place-items: center; border-radius: 50%; border: 1px solid var(--p-border); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.68rem; color: var(--p-muted); background: var(--p-bg); transition: all .2s ease; }
  .portfolio-root .p-x3d-name { min-width: 0; font-size: 0.85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .portfolio-root .p-x3d-parts button.done .p-x3d-num { border-color: color-mix(in srgb, var(--p-accent) 45%, transparent); color: var(--p-accent); }
  .portfolio-root .p-x3d-parts button.done .p-x3d-name { color: var(--p-muted); }
  .portfolio-root .p-x3d-parts button.on { background: color-mix(in srgb, var(--p-accent) 12%, transparent); }
  .portfolio-root .p-x3d-parts button.on .p-x3d-num { background: var(--p-accent); border-color: var(--p-accent); color: #fff; }
  .portfolio-root .p-x3d-parts button.on .p-x3d-name { font-weight: 700; }
  @media (max-height: 760px) and (min-width: 901px) {
    .portfolio-root .p-x3d-sticky { padding-top: 84px; gap: 8px; }
    .portfolio-root .p-x3d-head .p-title { font-size: clamp(1.6rem, 3vw, 2.2rem); }
    .portfolio-root .p-x3d-parts button { padding: 3px 8px; }
    .portfolio-root .p-x3d-card p { min-height: 0; }
  }
  @media (max-width: 900px) {
    .portfolio-root .p-x3d { height: 520vh; }
    .portfolio-root .p-x3d-sticky { padding: 80px 12px 14px; gap: 8px; }
    .portfolio-root .p-x3d-hint { font-size: 0.82rem; }
    .portfolio-root .p-x3d-body { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; gap: 10px; }
    .portfolio-root .p-x3d-panel { align-self: stretch; gap: 8px; }
    .portfolio-root .p-x3d-card { padding: 12px 14px 14px; }
    .portfolio-root .p-x3d-card h3 { font-size: 1.02rem; }
    .portfolio-root .p-x3d-card p { font-size: 0.86rem; min-height: 2.6em; }
    .portfolio-root .p-x3d-parts { display: flex; gap: 6px; overflow-x: auto; overflow-y: hidden; max-width: 100%; scroll-snap-type: x proximity; scrollbar-width: none; padding-bottom: 2px; }
    .portfolio-root .p-x3d-parts::-webkit-scrollbar { display: none; }
    .portfolio-root .p-x3d-parts li { flex: none; scroll-snap-align: center; }
    .portfolio-root .p-x3d-parts button { width: auto; padding: 6px 12px 6px 6px; gap: 8px; border: 1px solid var(--p-border); border-radius: 999px; background: var(--p-bg); }
    .portfolio-root .p-x3d-parts button.on { border-color: var(--p-accent); }
    .portfolio-root .p-x3d-num { width: 22px; height: 22px; font-size: 0.62rem; }
    .portfolio-root .p-x3d-name { font-size: 0.82rem; }
  }
`;

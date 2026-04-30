import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useSections, useSiteSettings } from "@/hooks/useSite";
import { Helmet } from "react-helmet-async";
import type { SectionRow, SiteSettings } from "@/lib/blocks";
import { useLang, LANGS, type Lang } from "@/contexts/LanguageContext";
import { mergeI18n, translateNavItems, translateString } from "@/lib/i18n";

const FONT_MAP: Record<string, string> = {
  Inter: "Inter:wght@300;400;500;600;700;800",
  Poppins: "Poppins:wght@300;400;500;600;700;800",
  Manrope: "Manrope:wght@300;400;500;600;700;800",
  "Space Grotesk": "Space+Grotesk:wght@300;400;500;600;700",
  Playfair: "Playfair+Display:wght@400;500;600;700;800;900",
  Syne: "Syne:wght@400;500;600;700;800",
  "DM Sans": "DM+Sans:wght@300;400;500;700",
};

export default function SiteRenderer() {
  const { data: sections, isLoading: sectionsLoading } = useSections(false);
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const isLoading = sectionsLoading || settingsLoading;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLang();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      setMenuOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fontFamily = settings?.font_family || "Inter";
  const fontSpec = FONT_MAP[fontFamily] || FONT_MAP.Inter;
  const fontHref = `https://fonts.googleapis.com/css2?family=${fontSpec}&display=swap`;

  useEffect(() => {
    const existing = document.getElementById("portfolio-fonts") as HTMLLinkElement | null;
    if (existing) existing.href = fontHref;
    else {
      const l = document.createElement("link");
      l.id = "portfolio-fonts";
      l.rel = "stylesheet";
      l.href = fontHref;
      document.head.appendChild(l);
    }
  }, [fontHref]);

  const t = settings?.theme ?? {
    accent: "#6c47ff",
    accent2: "#ff4f7b",
    accent3: "#00d9a5",
    bg: "#f5f3ef",
    fg: "#0e0e0e",
    heroGradient: "linear-gradient(135deg, #7b5fff 0%, #5b8fff 40%, #00d9a5 100%)",
  };

  const radius = settings?.radius ?? 14;

  const styleVars = {
    "--p-bg": t.bg,
    "--p-fg": t.fg,
    "--p-accent": t.accent,
    "--p-accent2": t.accent2,
    "--p-accent3": t.accent3,
    "--p-hero": t.heroGradient,
    "--p-border": "#e0ddd7",
    "--p-muted": "#888",
    "--p-radius": `${radius}px`,
    "--p-font": `'${fontFamily}', sans-serif`,
  } as React.CSSProperties;

  if (isLoading) {
    return <div style={{ minHeight: "100vh", background: t.bg }} aria-hidden />;
  }

  return (
    <>
      <Helmet>
        <title>{settings?.site_title || settings?.logo_text || "Portfolio"}</title>
        <meta name="description" content={settings?.meta_description || "Personal portfolio."} />
        {settings?.favicon_url && <link rel="icon" href={settings.favicon_url} />}
        {settings?.og_image_url && <meta property="og:image" content={settings.og_image_url} />}
        {settings?.site_title && <meta property="og:title" content={settings.site_title} />}
      </Helmet>
      <div style={styleVars} className="portfolio-root">
        <style>{`
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
          .portfolio-root .p-card { background: var(--p-bg); border-radius: calc(var(--p-radius) + 6px); overflow: hidden; border: 1px solid var(--p-border); transition: transform .25s; }
          .portfolio-root .p-card:hover { transform: translateY(-6px); }
          .portfolio-root .p-card.featured { border-color: var(--p-accent); box-shadow: 0 8px 24px hsl(from var(--p-accent) h s l / 0.2); }
          .portfolio-root .p-card-thumb { height: 160px; display:flex; align-items:center; justify-content:center; font-size: 2.5rem; background: linear-gradient(135deg, var(--p-accent), var(--p-accent3)); color:#fff; }
          .portfolio-root .p-card-thumb img { width:100%; height:100%; object-fit:cover; }
          .portfolio-root .p-card-body { padding: 20px; }
          .portfolio-root .p-card-tag { font-size: 0.72rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--p-accent); margin-bottom: 6px; }
          .portfolio-root .p-card h3 { font-family: var(--p-font); font-size: 1.1rem; margin: 0 0 8px; }
          .portfolio-root .p-card p { font-size: 0.88rem; color: var(--p-muted); line-height: 1.6; margin-bottom: 16px; }
          .portfolio-root .p-card a { font-size: 0.85rem; font-weight: 700; color: var(--p-accent); text-decoration: none; }
          .portfolio-root .p-timeline { position: relative; padding-left: 28px; }
          .portfolio-root .p-timeline::before { content: ''; position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: var(--p-border); }
          .portfolio-root .p-tl-item { position: relative; margin-bottom: 44px; }
          .portfolio-root .p-tl-dot { position: absolute; left: -28px; top: 5px; width: 14px; height: 14px; border-radius: 50%; background: var(--p-accent); border: 2px solid #fff; box-shadow: 0 0 0 3px var(--p-accent); }
          .portfolio-root .p-tl-period { font-size: 0.78rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--p-muted); margin-bottom: 4px; }
          .portfolio-root .p-tl-role { font-family: var(--p-font); font-size: 1.15rem; font-weight: 700; }
          .portfolio-root .p-tl-company { font-size: 0.95rem; color: var(--p-accent); font-weight: 600; margin-bottom: 8px; }
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
          @media (max-width: 800px) {
            .portfolio-root .p-hero-grid.has-image { grid-template-columns: 1fr; }
            .portfolio-root .p-hero-photo { max-width: 240px; }
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
          }
          @media (max-width: 420px) {
            .portfolio-root nav.p-nav { padding: 8px 14px; }
            .portfolio-root .p-section { padding: 50px 16px; }
            .portfolio-root .p-hero { padding: 90px 16px 50px; }
            .portfolio-root .p-hero-title { font-size: clamp(2rem, 11vw, 2.8rem); }
            .portfolio-root .p-hero-photo { max-width: 180px !important; }
            .portfolio-root .p-title { font-size: 1.6rem; margin-bottom: 22px; }
          }
        `}</style>

        <nav className={`p-nav${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
          <div className="p-nav-row">
            <div className="p-logo">
              {(() => {
                const text = settings?.logo_text ?? "Portfolio";
                const words = text.trim().split(/\s+/);
                return words.map((w, i) => {
                  const first = w.charAt(0);
                  const rest = w.slice(1);
                  return (
                    <span key={i} className="p-logo-word">
                      {first}
                      <span className="p-logo-rest">{rest}</span>
                    </span>
                  );
                });
              })()}
              <span className="p-logo-dot">.</span>
            </div>
            <ul className="p-nav-links">
              {(settings?.nav_items ?? []).map((it, i) => (
                <li key={i}><a href={it.href}>{it.label}</a></li>
              ))}
            </ul>
            <button
              type="button"
              className="p-nav-burger"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
          {menuOpen && (
            <ul className="p-mobile-menu">
              {(settings?.nav_items ?? []).map((it, i) => (
                <li key={i}>
                  <a href={it.href} onClick={() => setMenuOpen(false)}>{it.label}</a>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {(sections ?? []).map((s, i) => (
          <RenderBlock key={s.id} section={s} alt={i % 2 === 1} settings={settings} />
        ))}

        <footer className="p-footer">{settings?.footer_text}</footer>
      </div>
    </>
  );
}

function getLayoutStyle(layout: any = {}): React.CSSProperties {
  const s: React.CSSProperties = {};
  if (layout.paddingY != null) s.paddingTop = s.paddingBottom = layout.paddingY;
  if (layout.bgImage) {
    s.backgroundImage = `url("${layout.bgImage}")`;
    s.backgroundSize = "cover";
    s.backgroundPosition = "center";
  }
  if (layout.bg) s.background = layout.bgImage
    ? `${layout.bg}, url("${layout.bgImage}") center/cover`
    : layout.bg;
  if (layout.textAlign) s.textAlign = layout.textAlign as any;
  return s;
}

function getInnerStyle(layout: any = {}): React.CSSProperties {
  const s: React.CSSProperties = {};
  if (layout.maxWidth) s.maxWidth = layout.maxWidth;
  if (layout.textAlign) s.textAlign = layout.textAlign as any;
  return s;
}

const IMAGE_SIZE_MAP: Record<string, string> = {
  small: "200px",
  medium: "360px",
  large: "520px",
  full: "100%",
};

function RenderBlock({ section, alt, settings }: { section: SectionRow; alt: boolean; settings: SiteSettings | null | undefined }) {
  const d = section.data ?? {};
  const sectionId = d.id || section.type;
  const layout = d.layout ?? {};
  const sectionStyle = getLayoutStyle(layout);
  const innerStyle = getInnerStyle(layout);

  switch (section.type) {
    case "hero": {
      const pos = layout.imagePos ?? "right";
      const imgMax = IMAGE_SIZE_MAP[layout.imageSize ?? "medium"];
      const heroBg = layout.bg || layout.bgImage
        ? sectionStyle
        : { background: "var(--p-hero)", ...sectionStyle };
      const isStacked = pos === "top" || pos === "bottom";
      const isBackground = pos === "background";
      const gridStyle: React.CSSProperties = isStacked
        ? { gridTemplateColumns: "1fr" }
        : d.image && !isBackground
        ? { gridTemplateColumns: pos === "left" ? "1fr 1.2fr" : "1.2fr 1fr" }
        : {};
      const photo = d.image && !isBackground && (
        <img className="p-hero-photo" src={d.image} alt={d.name || "Portrait"} style={{ maxWidth: imgMax, objectPosition: d.imageFocal || "50% 50%" }} />
      );
      const text = (
        <div>
          {d.tag && <div className="p-hero-tag">{d.tag}</div>}
          <h1 className="p-hero-title">Hello<span className="dot">.</span><br />I'm {d.name}<span className="dot">.</span></h1>
          <p className="p-hero-sub">{d.subtitle}</p>
          <div className="p-btns">
            {d.primaryBtn?.label && <a className="p-btn-primary" href={d.primaryBtn.href}>{d.primaryBtn.label}</a>}
            {d.secondaryBtn?.label && <a className="p-btn-ghost" href={d.secondaryBtn.href}>{d.secondaryBtn.label}</a>}
            {d.cvUrl && (
              <a className="p-btn-cv" href={d.cvUrl} download target="_blank" rel="noreferrer">
                {d.cvLabel || "Download CV"}
              </a>
            )}
          </div>
        </div>
      );
      const heroSectionStyle: React.CSSProperties = isBackground && d.image
        ? { ...heroBg, backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("${d.image}")`, backgroundSize: "cover", backgroundPosition: d.imageFocal || "center" }
        : heroBg;
      return (
        <section id={sectionId} className="p-hero" style={heroSectionStyle}>
          <div className="p-inner" style={{ width: "100%", ...innerStyle }}>
            <div className="p-hero-grid" style={gridStyle}>
              {pos === "left" || pos === "top" ? <>{photo}{text}</> : <>{text}{photo}</>}
            </div>
          </div>
        </section>
      );
    }
    case "about": {
      const pos = layout.imagePos ?? "right";
      const imgMax = IMAGE_SIZE_MAP[layout.imageSize ?? "medium"];
      const isStacked = pos === "top" || pos === "bottom";
      const gridStyle: React.CSSProperties = !d.portrait || isStacked
        ? { gridTemplateColumns: "1fr" }
        : { gridTemplateColumns: pos === "left" ? "1fr 1.2fr" : "1.2fr 1fr" };
      const portrait = d.portrait && (
        <img className="p-about-portrait" src={d.portrait} alt="" style={{ maxWidth: imgMax, objectPosition: d.portraitFocal || "50% 50%" }} />
      );
      const text = (
        <div className="p-about-text">
          {(d.paragraphs ?? []).map((p: string, i: number) => <p key={i}>{p}</p>)}
          {(d.skills ?? []).length > 0 && (
            <div className="p-skills">
              {d.skills.map((s: string, i: number) => <span key={i} className="p-skill">{s}</span>)}
            </div>
          )}
        </div>
      );
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            <div className="p-about-grid" style={gridStyle}>
              {pos === "left" || pos === "top" ? <>{portrait}{text}</> : <>{text}{portrait}</>}
            </div>
          </div>
        </section>
      );
    }
    case "stats":
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            {(d.items ?? []).map((it: any, i: number) => (
              <div key={i}>
                <div className="p-stat-label"><span>{it.label}</span><span>{it.value}%</span></div>
                <div className="p-stat-track"><div className="p-stat-fill" style={{ width: `${it.value}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      );
    case "skills":
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            {(d.groups ?? []).map((g: any, i: number) => (
              <div key={i} className="p-skill-group">
                {g.name && <h4>{g.name}</h4>}
                <div className="p-skill-row">
                  {(g.items ?? []).map((s: string, j: number) => <span key={j} className="p-pill">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    case "languages":
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            {(d.items ?? []).map((it: any, i: number) => (
              <div key={i}>
                <div className="p-lang-row">
                  <span>{it.name}</span>
                  <span className="p-lang-level">{it.level}</span>
                </div>
                <div className="p-stat-track"><div className="p-stat-fill" style={{ width: `${it.value ?? 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      );
    case "projects":
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            <div className="p-projects">
              {(d.items ?? []).map((it: any, i: number) => (
                <div key={i} className={`p-card${it.featured ? " featured" : ""}`}>
                  <div className="p-card-thumb">{it.image ? <img src={it.image} alt={it.title} style={{ objectPosition: it.focal || "50% 50%" }} /> : it.emoji || "✨"}</div>
                  <div className="p-card-body">
                    {it.tag && <div className="p-card-tag">{it.tag}</div>}
                    <h3>{it.title}</h3>
                    <p>{it.description}</p>
                    {it.link && <a href={it.link} target="_blank" rel="noreferrer">View →</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "experience":
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            <div className="p-timeline">
              {(d.items ?? []).map((it: any, i: number) => (
                <div key={i} className="p-tl-item">
                  <div className="p-tl-dot" />
                  <div className="p-tl-period">{it.period}</div>
                  <div className="p-tl-role">{it.role}</div>
                  <div className="p-tl-company">{it.company}</div>
                  <div className="p-tl-desc">{it.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "contact":
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            <div className="p-contact-info">
              {d.intro && <p>{d.intro}</p>}
              <div className="p-contact-grid">
                {(d.links ?? []).map((l: any, i: number) => (
                  <a key={i} className="p-contact-link" href={l.href} target="_blank" rel="noreferrer">
                    {l.iconUrl
                      ? <img className="p-contact-icon" src={l.iconUrl} alt="" />
                      : <span>{l.icon}</span>}
                    <span>{l.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    case "logos":
      return (
        <section id={sectionId} className="p-logos-section" style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-logos-label">{d.label}</div>}
            {d.title && <h2 className="p-title" style={{ textAlign: "center", marginBottom: 28 }}>{d.title}</h2>}
            <div className="p-logos-row">
              {(d.items ?? []).map((it: any, i: number) => {
                const content = it.logo
                  ? <img src={it.logo} alt={it.name || ""} />
                  : <span style={{ fontWeight: 700, color: "var(--p-muted)" }}>{it.name}</span>;
                return it.href ? (
                  <a key={i} className="p-logo-item" href={it.href} target="_blank" rel="noreferrer" aria-label={it.name}>{content}</a>
                ) : (
                  <span key={i} className="p-logo-item" aria-label={it.name}>{content}</span>
                );
              })}
            </div>
          </div>
        </section>
      );
    case "image":
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={{ textAlign: layout.textAlign || d.align || "center", ...innerStyle }}>
            {d.src && <img src={d.src} alt={d.alt || ""} style={{ maxWidth: d.maxWidth || 720, width: "100%", borderRadius: 16, objectFit: "cover", objectPosition: d.focal || "50% 50%" }} />}
            {d.caption && <p style={{ color: "var(--p-muted)", marginTop: 12, fontSize: ".9rem" }}>{d.caption}</p>}
          </div>
        </section>
      );
    case "html":
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(d.html || "") }} />
        </section>
      );
    case "footer":
      return (
        <div style={{ padding: "20px 40px", textAlign: "center", color: "var(--p-muted)", fontSize: ".9rem" }}>
          {d.text}
        </div>
      );
    default:
      return null;
  }
}

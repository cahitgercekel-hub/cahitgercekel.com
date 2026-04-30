import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSite";
import { useLang, LANGS } from "@/contexts/LanguageContext";
import { translateNavItems, translateString } from "@/lib/i18n";
import { PORTFOLIO_CSS } from "./portfolioStyles";

const FONT_MAP: Record<string, string> = {
  Inter: "Inter:wght@300;400;500;600;700;800",
  Poppins: "Poppins:wght@300;400;500;600;700;800",
  Manrope: "Manrope:wght@300;400;500;600;700;800",
  "Space Grotesk": "Space+Grotesk:wght@300;400;500;600;700",
  Playfair: "Playfair+Display:wght@400;500;600;700;800;900",
  Syne: "Syne:wght@400;500;600;700;800",
  "DM Sans": "DM+Sans:wght@300;400;500;700",
};

/**
 * Shared portfolio chrome: header/nav (with mobile burger + language switcher),
 * footer, floating language pill, theme CSS variables, and Google fonts loader.
 * Used by both the home page and project detail pages.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const { data: settings } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLang();

  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      setShowTop(window.scrollY > 300);
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

  const navItems = translateNavItems(settings?.nav_items, settings?.i18n, lang);
  const logoText = translateString(settings?.logo_text, settings?.i18n, lang, "logo_text") || "Portfolio";
  const logoWords = logoText.trim().split(/\s+/);

  return (
    <div style={styleVars} className="portfolio-root">
      <style>{PORTFOLIO_CSS}</style>

      <nav className={`p-nav${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
        <div className="p-nav-row">
          <div className="p-logo">
            <Link to="/">
              {logoWords.map((w, i) => (
                <span key={i} className="p-logo-word">
                  {w.charAt(0)}
                  <span className="p-logo-rest">{w.slice(1)}</span>
                </span>
              ))}
              <span className="p-logo-dot">.</span>
            </Link>
          </div>
          <ul className="p-nav-links">
            {navItems.map((it, i) => (
              <li key={i}><a href={it.href.startsWith("#") ? `/${it.href}` : it.href}>{it.label}</a></li>
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
          <>
            <ul className="p-mobile-menu">
              {navItems.map((it, i) => (
                <li key={i}>
                  <a href={it.href.startsWith("#") ? `/${it.href}` : it.href} onClick={() => setMenuOpen(false)}>{it.label}</a>
                </li>
              ))}
            </ul>
            <div className="p-lang-mobile" role="group" aria-label="Language">
              {LANGS.map((l, i) => (
                <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  {i > 0 && <span className="p-lang-sep">|</span>}
                  <button
                    type="button"
                    className={lang === l ? "active" : ""}
                    onClick={() => setLang(l)}
                  >
                    {l.toUpperCase()}
                  </button>
                </span>
              ))}
            </div>
          </>
        )}
      </nav>

      {children}

      <footer className="p-footer">
        <div className="p-inner p-footer-inner">
          <p>{translateString(settings?.footer_text, settings?.i18n, lang, "footer_text")}</p>
          <button
            type="button"
            className="p-footer-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top ↑
          </button>
        </div>
      </footer>

      <div className="p-lang-pill" role="group" aria-label="Language">
        {LANGS.map((l, i) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span className="p-lang-sep">|</span>}
            <button
              type="button"
              className={lang === l ? "active" : ""}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
            >
              {l.toUpperCase()}
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        className={`p-to-top${showTop ? " visible" : ""}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

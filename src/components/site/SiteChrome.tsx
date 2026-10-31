import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSite";
import { useLang, LANGS } from "@/contexts/LanguageContext";
import { translateNavItems, translateString, ui } from "@/lib/i18n";
import { localizedPath, stripLang } from "@/lib/seo";
import { PORTFOLIO_CSS } from "./portfolioStyles";

// Fonts are self-hosted (Fontsource) instead of loaded from Google Fonts:
// faster (same origin, no extra DNS/TLS) and no visitor IPs sent to Google.
// Each loader is its own chunk, so only the selected font is downloaded.
const FONTS: Record<string, { family: string; load: () => Promise<unknown> }> = {
  Inter: { family: "'Inter Variable', 'Inter'", load: () => import("@fontsource-variable/inter") },
  Poppins: {
    family: "'Poppins'",
    load: () => Promise.all([
      import("@fontsource/poppins/300.css"), import("@fontsource/poppins/400.css"),
      import("@fontsource/poppins/500.css"), import("@fontsource/poppins/600.css"),
      import("@fontsource/poppins/700.css"), import("@fontsource/poppins/800.css"),
    ]),
  },
  Manrope: { family: "'Manrope Variable', 'Manrope'", load: () => import("@fontsource-variable/manrope") },
  "Space Grotesk": { family: "'Space Grotesk Variable', 'Space Grotesk'", load: () => import("@fontsource-variable/space-grotesk") },
  Playfair: { family: "'Playfair Display Variable', 'Playfair Display'", load: () => import("@fontsource-variable/playfair-display") },
  Syne: { family: "'Syne Variable', 'Syne'", load: () => import("@fontsource-variable/syne") },
  "DM Sans": { family: "'DM Sans Variable', 'DM Sans'", load: () => import("@fontsource-variable/dm-sans") },
};

/**
 * Shared portfolio chrome: header/nav (with mobile burger + language switcher),
 * footer, floating language pill, theme CSS variables, and Google fonts loader.
 * Used by both the home page and project detail pages.
 */
/** In-page shortcut for the nav (project pages): `id` is the id of a section on the current page. */
export type PageNavItem = { id: string; label: string };

/** Home sections that stay in the nav on pages with their own shortcuts. */
const KEEP_HOME_SECTIONS = ["about", "projects"];

export default function SiteChrome({ children, pageNav }: { children: ReactNode; pageNav?: PageNavItem[] }) {
  const { data: settings } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_OFFSET = 80;
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
    try { window.history.replaceState(null, "", `#${id}`); } catch {}
  };
  const handleNavClick = (e: React.MouseEvent, href: string, local = false) => {
    // Extract anchor id from "#x" or "/#x"
    const hashIdx = href.indexOf("#");
    if (hashIdx === -1) return; // not a hash link, let it navigate normally
    const id = href.slice(hashIdx + 1);
    if (!id) return;
    e.preventDefault();
    setMenuOpen(false);
    if (local) {
      scrollToId(id);
    } else if (stripLang(location.pathname) !== "/") {
      navigate(localizedPath("/", lang));
      // Wait for the home page to render, then scroll.
      setTimeout(() => scrollToId(id), 80);
    } else {
      scrollToId(id);
    }
  };

  const [showTop, setShowTop] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  // The logo collapses to its initials ("CEG.") once the page's hero has scrolled out from under the nav.
  const [pastHero, setPastHero] = useState(false);

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

  useEffect(() => {
    const check = () => {
      const hero = document.querySelector<HTMLElement>(".portfolio-root .p-hero, .portfolio-root .p-pd-hero");
      const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 80;
      setPastHero(hero ? hero.getBoundingClientRect().bottom <= navBottom : window.scrollY > 80);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    // The hero renders after the content loads, and its height can change; re-check when the page resizes.
    const ro = new ResizeObserver(check);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      ro.disconnect();
    };
  }, [location.pathname]);

  const fontFamily = settings?.font_family || "Inter";
  const font = FONTS[fontFamily] || FONTS.Inter;

  useEffect(() => {
    font.load().catch(() => {});
  }, [font]);

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
    "--p-font": `${font.family}, sans-serif`,
  } as React.CSSProperties;

  const homeItems = translateNavItems(settings?.nav_items, settings?.i18n, lang);
  const hasPageNav = !!pageNav && pageNav.length > 0;
  type NavEntry = { label: string; href: string; local?: boolean };
  const navItems: NavEntry[] = hasPageNav
    ? [
        ...pageNav!.map((p) => ({ label: p.label, href: `#${p.id}`, local: true })),
        ...homeItems.filter((it) => KEEP_HOME_SECTIONS.includes(it.href.replace(/^\/?#/, ""))),
      ]
    : homeItems;

  // Highlight the in-page section that is currently on screen.
  const [currentId, setCurrentId] = useState("");
  const pageNavKey = hasPageNav ? pageNav!.map((p) => p.id).join("|") : "";
  useEffect(() => {
    if (!pageNavKey) return;
    const ids = pageNavKey.split("|");
    const onScroll = () => {
      const line = window.innerHeight * 0.35;
      let cur = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) cur = id;
      }
      setCurrentId(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pageNavKey]);
  const logoText = translateString(settings?.logo_text, settings?.i18n, lang, "logo_text") || "Portfolio";
  const logoWords = logoText.trim().split(/\s+/);

  // Fit the nav to its width in any language/zoom: if the links overflow,
  // first collapse the logo to initials, then fall back to the burger menu.
  const rowRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<"" | "fit-short" | "fit-burger">("");
  useLayoutEffect(() => {
    const nav = navRef.current;
    const row = rowRef.current;
    if (!nav || !row) return;
    const fit = () => {
      if (window.matchMedia("(max-width: 700px)").matches) {
        nav.classList.remove("fit-short", "fit-burger");
        setFit("");
        return;
      }
      // Measure synchronously with transitions off, then hand the result to React.
      nav.classList.add("fit-measure");
      nav.classList.remove("fit-short", "fit-burger");
      const overflows = () => row.scrollWidth > row.clientWidth + 1;
      let next: "" | "fit-short" | "fit-burger" = "";
      if (overflows()) {
        nav.classList.add("fit-short");
        next = "fit-short";
        if (overflows()) { nav.classList.add("fit-burger"); next = "fit-burger"; }
      }
      void row.offsetWidth; // apply the final state before transitions come back
      nav.classList.remove("fit-measure");
      setFit(next);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(row);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [lang, logoText, navItems.length]);
  // In-page anchors ("#x" / "/#x") point at this language's home page.
  const navHref = (href: string, local = false) =>
    local ? href : href.startsWith("#") || href.startsWith("/#") ? localizedPath(href.replace(/^\/?/, "/"), lang) : href;
  const langHref = (l: typeof lang) => localizedPath(stripLang(location.pathname), l) + location.hash;

  return (
    <div style={styleVars} className="portfolio-root">
      <style>{PORTFOLIO_CSS}</style>

      <nav ref={navRef} className={`p-nav${scrolled ? " scrolled" : ""}${pastHero ? " compact" : ""}${menuOpen ? " menu-open" : ""}${fit === "fit-burger" ? " fit-short fit-burger" : fit ? ` ${fit}` : ""}`}>
        <div ref={rowRef} className="p-nav-row">
          <div className="p-logo">
            <Link to={localizedPath("/", lang)}>
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
              <li key={i} className={hasPageNav && !it.local && navItems[i - 1]?.local ? "p-nav-sep" : undefined}>
                <a
                  href={navHref(it.href, it.local)}
                  onClick={(e) => handleNavClick(e, it.href, it.local)}
                  className={it.local && currentId === it.href.slice(1) ? "active" : undefined}
                  aria-current={it.local && currentId === it.href.slice(1) ? "location" : undefined}
                >
                  {it.label}
                </a>
              </li>
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
                <li key={i} className={hasPageNav && !it.local && navItems[i - 1]?.local ? "p-nav-sep" : undefined}>
                  <a
                    href={navHref(it.href, it.local)}
                    onClick={(e) => handleNavClick(e, it.href, it.local)}
                    className={it.local && currentId === it.href.slice(1) ? "active" : undefined}
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="p-lang-mobile" role="group" aria-label="Language">
              {LANGS.map((l, i) => (
                <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  {i > 0 && <span className="p-lang-sep">|</span>}
                  <Link
                    to={langHref(l)}
                    hrefLang={l}
                    className={lang === l ? "active" : ""}
                    aria-current={lang === l ? "page" : undefined}
                  >
                    {l.toUpperCase()}
                  </Link>
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
            {ui("backToTop", lang)}
          </button>
        </div>
      </footer>

      <div className="p-lang-pill" role="group" aria-label="Language">
        {LANGS.map((l, i) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span className="p-lang-sep">|</span>}
            <Link
              to={langHref(l)}
              hrefLang={l}
              className={lang === l ? "active" : ""}
              aria-current={lang === l ? "page" : undefined}
            >
              {l.toUpperCase()}
            </Link>
          </span>
        ))}
      </div>
      <button
        type="button"
        className={`p-to-top${showTop ? " visible" : ""}`}
        aria-label={ui("backToTopLabel", lang)}
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

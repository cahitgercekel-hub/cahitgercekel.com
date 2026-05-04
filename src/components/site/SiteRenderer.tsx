import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { useSections, useSiteSettings } from "@/hooks/useSite";
import { Helmet } from "react-helmet-async";
import DotGrid from "./DotGrid";
import SplitText from "./SplitText";
import RotatingText from "./RotatingText";
import type { SectionRow, SiteSettings } from "@/lib/blocks";
import { useLang, type Lang } from "@/contexts/LanguageContext";
import { mergeI18n } from "@/lib/i18n";
import { projectSlug } from "@/lib/projectSlug";
import SiteChrome from "./SiteChrome";
import BorderGlow from "./BorderGlow";

export default function SiteRenderer() {
  const { data: sections, isLoading: sectionsLoading } = useSections(false);
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const isLoading = sectionsLoading || settingsLoading;
  const { lang } = useLang();

  if (isLoading) {
    return <div style={{ minHeight: "100vh", background: settings?.theme?.bg || "#f5f3ef" }} aria-hidden />;
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
      <SiteChrome>
        {(sections ?? []).map((s, i) => (
          <RenderBlock key={s.id} section={s} alt={i % 2 === 1} settings={settings} lang={lang} />
        ))}
      </SiteChrome>
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

function RenderBlock({ section, alt, settings, lang }: { section: SectionRow; alt: boolean; settings: SiteSettings | null | undefined; lang: Lang }) {
  const raw = section.data ?? {};
  const d = mergeI18n(raw, lang);
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
      const heroLine1 = `${d.greeting || "Hello"}.`;
      const heroLine2 = `${d.nameLine || `${d.intro || "I'm"} ${d.name || ""}`.trim()}.`;
      const text = (
        <div>
          {d.tag && <div className="p-hero-tag text-center">{d.tag}</div>}
          <h1 className="p-hero-title" style={{ display: "block" }}>
            <SplitText
              tag="span"
              text={heroLine1}
              splitType="chars"
              delay={40}
              duration={0.7}
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              style={{ display: "block" }}
            />
            <SplitText
              tag="span"
              text={heroLine2}
              splitType="chars"
              delay={35}
              duration={0.7}
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              style={{ display: "block" }}
            />
          </h1>
          {d.subtitle && (
            <SplitText
              tag="p"
              className="p-hero-sub"
              text={d.subtitle}
              splitType="words"
              delay={60}
              duration={0.6}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
            />
          )}
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
      const dotBg = d.dotBg ?? {};
      return (
        <section id={sectionId} className="p-hero" style={{ ...heroSectionStyle, position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, background: dotBg.background || "transparent" }}>
            <DotGrid
              dotSize={dotBg.dotSize ?? 6}
              gap={dotBg.gap ?? 22}
              baseColor={dotBg.baseColor ?? "#d4d0c8"}
              activeColor={dotBg.activeColor ?? "#db0000"}
              proximity={dotBg.proximity ?? 120}
              shockRadius={dotBg.shockRadius ?? 250}
              shockStrength={dotBg.shockStrength ?? 5}
              resistance={dotBg.resistance ?? 750}
              returnDuration={dotBg.returnDuration ?? 1.5}
            />
          </div>
          <div className="p-inner" style={{ width: "100%", position: "relative", zIndex: 1, ...innerStyle }}>
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
            {d.title && (
              <h2 className="p-title" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                <span>{d.title}</span>
                {Array.isArray(d.rotatingPills?.texts) && d.rotatingPills.texts.filter(Boolean).length > 0 && (
                  <RotatingText
                    texts={d.rotatingPills.texts.filter(Boolean)}
                    rotationInterval={d.rotatingPills?.intervalMs ?? 2000}
                    staggerDuration={d.rotatingPills?.staggerDuration ?? 0.025}
                    staggerFrom={d.rotatingPills?.staggerFrom ?? "last"}
                    splitBy="characters"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    mainClassName="px-3 py-1 rounded-lg overflow-hidden"
                    splitLevelClassName="overflow-hidden pb-0.5"
                    style={{
                      background: d.rotatingPills?.bg ?? "#db0000",
                      color: d.rotatingPills?.fg ?? "#ffffff",
                      fontSize: "0.7em",
                      lineHeight: 1.2,
                    }}
                  />
                )}
              </h2>
            )}
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
                <div className="p-stat-track"><div className="p-stat-fill" style={{ width: `${it.value}%`, ...(d.barColor ? { background: d.barColor } : {}) }} /></div>
              </div>
            ))}
          </div>
        </section>
      );
    case "skills": {
      const glow = d.glow ?? {};
      const glowEnabled = glow.enabled !== false;
      const glowFilled = glow.filled === true;
      const colorsArr = (typeof glow.colors === "string" && glow.colors.trim())
        ? glow.colors.split(",").map((c: string) => c.trim()).filter(Boolean)
        : (Array.isArray(glow.colors) && glow.colors.length ? glow.colors : ['#c084fc', '#f472b6', '#38bdf8']);
      const borderRadius = Number(glow.borderRadius ?? 999);
      const glowRadius = Number(glow.glowRadius ?? 20);
      const glowIntensity = Number(glow.glowIntensity ?? 1);
      const edgeSensitivity = Number(glow.edgeSensitivity ?? 20);
      const coneSpread = Number(glow.coneSpread ?? 30);
      const glowColor = glow.glowColor || '40 80 80';
      const bg = glowFilled ? (glow.fillColor || '#120F17') : 'transparent';
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            {(d.groups ?? []).map((g: any, i: number) => (
              <div key={i} className="p-skill-group">
                {g.name && <h4>{g.name}</h4>}
                <div className="p-skill-row">
                  {(g.items ?? []).map((s: string, j: number) => (
                    glowEnabled ? (
                      <BorderGlow
                        key={j}
                        borderRadius={borderRadius}
                        glowRadius={glowRadius}
                        edgeSensitivity={edgeSensitivity}
                        coneSpread={coneSpread}
                        glowIntensity={glowIntensity}
                        glowColor={glowColor}
                        backgroundColor={bg}
                        colors={colorsArr}
                      >
                        <span className="p-pill">{s}</span>
                      </BorderGlow>
                    ) : (
                      <span key={j} className="p-pill">{s}</span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "languages":
      return <LanguagesBlock sectionId={sectionId} d={d} alt={alt} sectionStyle={sectionStyle} innerStyle={innerStyle} />;
    case "projects": {
      const items: any[] = d.items ?? [];
      const usedSlugs = new Set<string>();
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            <div className="p-projects">
              {items.map((it: any, i: number) => {
                // Compute a unique slug for this card (matches ProjectDetail lookup).
                let base = projectSlug(it);
                let slug = base;
                let n = 2;
                while (slug && usedSlugs.has(slug)) slug = `${base}-${n++}`;
                if (slug) usedSlugs.add(slug);

                const hasDetail = !it.openExternal && !!slug;
                const ctaLabel = it.caseStudy?.enabled ? "Open case study →" : "View →";
                const status = (it.status || "").toLowerCase() || (it.link ? "live" : "");
                const inner = (
                  <>
                    <div className="p-card-thumb">{it.image ? (
                      <>
                        <img className="p-card-thumb-bg" src={it.image} alt="" aria-hidden />
                        <img className="p-card-thumb-img" src={it.image} alt={it.title} style={{ objectPosition: it.focal || "50% 50%" }} />
                      </>
                    ) : (it.emoji || "✨")}</div>
                    <div className="p-card-body" style={{ position: "relative" }}>
                      {it.tag && <div className="p-card-tag">{it.tag}</div>}
                      <h3>{it.title}</h3>
                      <p>{it.description}</p>
                      {Array.isArray(it.pills) && it.pills.length > 0 && (
                        <div className="p-card-pills">
                          {it.pills.map((p: string, idx: number) => (
                            <span key={idx} className="p-card-pill">{p}</span>
                          ))}
                        </div>
                      )}
                      <div className="p-card-footer">
                        <span className="p-card-cta">{ctaLabel}</span>
                        {status === "live" && it.link && (
                          <a
                            href={it.link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-card-live-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            title="View Live Site"
                          >
                            <span className="p-card-live-dot" />
                            {it.liveText || "Live"}
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                );
                const cls = `p-card${it.featured ? " featured" : ""}`;
                if (hasDetail) {
                  return <Link key={i} to={`/${slug}`} className={cls}>{inner}</Link>;
                }
                if (it.link && it.openExternal) {
                  return <a key={i} className={cls} href={it.link} target="_blank" rel="noreferrer">{inner}</a>;
                }
                return <div key={i} className={cls}>{inner}</div>;
              })}
            </div>
          </div>
        </section>
      );
    }
    case "experience":
      return (
        <section id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
          <div className="p-inner" style={innerStyle}>
            {d.label && <div className="p-label">{d.label}</div>}
            {d.title && <h2 className="p-title">{d.title}</h2>}
            <div className="p-timeline">
              {(d.items ?? []).map((it: any, i: number) => (
                <div key={i} className="p-tl-item">
                  <div
                    className="p-tl-dot"
                    style={
                      d.dotColor
                        ? { background: d.dotColor, boxShadow: `0 0 0 3px ${d.dotColor}` }
                        : undefined
                    }
                  />
                  <div className="p-tl-period">{it.period}</div>
                  <div className="p-tl-role">{it.role}</div>
                  <div className="p-tl-company-row">
                    {it.logo && <img className="p-tl-logo" src={it.logo} alt="" />}
                    <div className="p-tl-company-text">
                      {it.companyHref ? (
                        <a className="p-tl-company" href={it.companyHref} target="_blank" rel="noreferrer">{it.company}</a>
                      ) : (
                        <span className="p-tl-company">{it.company}</span>
                      )}
                      {it.location && <div className="p-tl-location">{it.location}</div>}
                    </div>
                  </div>
                  <div className="p-tl-desc" style={{ whiteSpace: "pre-line" }}>{it.description}</div>
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

// Module-level guard so the bars only animate once per full page load.
const playedLanguageAnim = { current: false };

function LanguagesBlock({ sectionId, d, alt, sectionStyle, innerStyle }: { sectionId: string; d: any; alt: boolean; sectionStyle: React.CSSProperties; innerStyle: React.CSSProperties }) {
  const ref = useRef<HTMLElement | null>(null);
  const [animate, setAnimate] = useState(playedLanguageAnim.current);

  useEffect(() => {
    if (playedLanguageAnim.current) {
      setAnimate(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            playedLanguageAnim.current = true;
            setAnimate(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} id={sectionId} className={`p-section ${alt ? "alt" : ""}`} style={sectionStyle}>
      <div className="p-inner" style={innerStyle}>
        {d.label && <div className="p-label">{d.label}</div>}
        {d.title && <h2 className="p-title">{d.title}</h2>}
        {(d.items ?? []).map((it: any, i: number) => {
          const target = it.value ?? 100;
          return (
            <div key={i}>
              <div className="p-lang-row">
                <span>{it.name}</span>
                <span className="p-lang-level">{it.level}</span>
              </div>
              <div className="p-stat-track">
                <div
                  className="p-stat-fill"
                  style={{
                    width: `${animate ? target : 0}%`,
                    transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
                    transitionDelay: `${i * 120}ms`,
                    ...(d.barColor ? { background: d.barColor } : {}),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

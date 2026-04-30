import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { useSections, useSiteSettings } from "@/hooks/useSite";
import { Helmet } from "react-helmet-async";
import Grainient from "./Grainient";
import type { SectionRow, SiteSettings } from "@/lib/blocks";
import { useLang, type Lang } from "@/contexts/LanguageContext";
import { mergeI18n } from "@/lib/i18n";
import { projectSlug } from "@/lib/projectSlug";
import SiteChrome from "./SiteChrome";

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
      const text = (
        <div>
          {d.tag && <div className="p-hero-tag">{d.tag}</div>}
          <h1 className="p-hero-title">{d.greeting || "Hello"}<span className="dot">.</span><br />{d.nameLine || `${d.intro || "I'm"} ${d.name || ""}`.trim()}<span className="dot">.</span></h1>
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
        <section id={sectionId} className="p-hero" style={{ ...heroSectionStyle, position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <Grainient
              color1="#9d9d9d"
              color2="#545454"
              color3="#9b9b9b"
              timeSpeed={0.25}
              warpStrength={1.0}
              warpFrequency={5.0}
              warpSpeed={2.0}
              warpAmplitude={50.0}
              blendSoftness={0.05}
              rotationAmount={500.0}
              noiseScale={2.0}
              grainAmount={0.1}
              grainScale={2.0}
              contrast={1.5}
              zoom={0.9}
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
                const inner = (
                  <>
                    <div className="p-card-thumb">{it.image ? <img src={it.image} alt={it.title} style={{ objectPosition: it.focal || "50% 50%" }} /> : it.emoji || "✨"}</div>
                    <div className="p-card-body">
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
                      {hasDetail
                        ? <span className="p-card-cta">{ctaLabel}</span>
                        : it.link && <a className="p-card-cta" href={it.link} target="_blank" rel="noreferrer">{ctaLabel}</a>}
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
                  <div className="p-tl-dot" />
                  <div className="p-tl-period">{it.period}</div>
                  <div className="p-tl-role">{it.role}</div>
                  <div className="p-tl-company-row">
                    {it.logo && <img className="p-tl-logo" src={it.logo} alt="" />}
                    {it.companyHref ? (
                      <a className="p-tl-company" href={it.companyHref} target="_blank" rel="noreferrer">{it.company}</a>
                    ) : (
                      <span className="p-tl-company">{it.company}</span>
                    )}
                  </div>
                  {it.location && <div className="p-tl-location">{it.location}</div>}
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

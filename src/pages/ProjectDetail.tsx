import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useSections, useSiteSettings } from "@/hooks/useSite";
import { useLang } from "@/contexts/LanguageContext";
import { mergeI18n } from "@/lib/i18n";
import SiteChrome from "@/components/site/SiteChrome";
import { findContactSection, findProjectBySlug, RESERVED_SLUGS } from "@/lib/projectSlug";
import NotFound from "./NotFound";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProjectDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: sections, isLoading } = useSections(false);
  const { data: settings } = useSiteSettings();
  const { lang } = useLang();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [slug]);

  useEffect(() => {
    if (selectedImg) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedImg]);

  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return <NotFound />;
  }

  if (isLoading) {
    return <div style={{ minHeight: "100vh", background: settings?.theme?.bg || "#f5f3ef" }} aria-hidden />;
  }

  const match = findProjectBySlug(sections, slug);
  if (!match) return <NotFound />;

  // Translate the single project item via the parent block's i18n.
  const blockTranslated = mergeI18n(match.blockData ?? {}, lang);
  const items: any[] = blockTranslated.items ?? [];
  const rawItems: any[] = match.blockData?.items ?? [];
  const idx = rawItems.indexOf(match.item);
  const item = (idx >= 0 ? items[idx] : match.item) ?? match.item;

  const gallery: any[] = item.gallery ?? [];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (gallery.length === 0) return;
    const nextIdx = (currentIndex + 1) % gallery.length;
    setCurrentIndex(nextIdx);
    setSelectedImg(gallery[nextIdx].src);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (gallery.length === 0) return;
    const prevIdx = (currentIndex - 1 + gallery.length) % gallery.length;
    setCurrentIndex(prevIdx);
    setSelectedImg(gallery[prevIdx].src);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImg) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setSelectedImg(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImg, currentIndex, gallery]);

  const useOverride = item.contactOverride?.enabled;
  const contactRaw = useOverride ? item.contactOverride : findContactSection(sections);
  const contactBlock = contactRaw ? mergeI18n({ ...contactRaw }, lang) : null;

  const pageTitle = `${item.title || "Project"} — ${settings?.site_title || settings?.logo_text || "Portfolio"}`;
  const pageDesc = item.subtitle || item.description || settings?.meta_description || "";

  const longParas = String(item.longDescription || "")
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const tech: string[] = item.tech ?? [];
  const links: { label: string; href: string }[] = (item.links ?? []).filter((l: any) => l?.href);
  const metrics: { label: string; value: string }[] = item.metrics ?? [];
  const csEnabled = item.caseStudy?.enabled;
  const csSections: any[] = item.caseStudy?.sections ?? [];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        {item.image && <meta property="og:image" content={item.image} />}
      </Helmet>
      <SiteChrome>
        {/* Hero */}
        <section className="p-pd-hero">
          <div className="p-inner" style={{ width: "100%" }}>
            <Link to="/#projects" className="p-pd-back">← Back to Home</Link>
            <div className="p-pd-head">
              {item.iconUrl && <img className="p-pd-icon" src={item.iconUrl} alt="" />}
              <h1 className="p-pd-title">{item.title}</h1>
              {(() => {
                const status: string = item.status ?? (item.link ? "live" : "");
                if (status === "live" && item.link) {
                  return (
                    <a className="p-pd-link-btn p-pd-live p-pd-head-btn" href={item.link} target="_blank" rel="noreferrer">
                      <span className="p-pd-live-dot" aria-hidden="true" />
                      <span>Live</span>
                    </a>
                  );
                }
                if (status === "in_progress") {
                  return (
                    <span className="p-pd-status p-pd-head-btn"><span aria-hidden="true">🚧</span><span>In Progress</span></span>
                  );
                }
                if (status === "none" && item.statusText) {
                  return (
                    <span className="p-pd-status p-pd-head-btn">{item.statusText}</span>
                  );
                }
                return null;
              })()}
            </div>
            {(item.tag || item.year) && (
              <div className="p-pd-tag-row">
                {item.tag && <div className="p-hero-tag">{item.tag}</div>}
                {item.year && <div className="p-pd-year-tag">{item.year}</div>}
              </div>
            )}
            {item.subtitle && <p className="p-pd-sub">{item.subtitle}</p>}
            {(item.role || item.client) && (
              <div className="p-pd-meta">
                {item.role && <span>{item.role}</span>}
                {item.client && <span>{item.client}</span>}
              </div>
            )}
            {tech.length > 0 && (
              <div className="p-pd-hero-tech">
                {tech.map((t, i) => <span key={i} className="p-pill">{t}</span>)}
              </div>
            )}
            {(() => {
              const hasGhost = links.length > 0;
              if (!hasGhost) return null;
              return (
                <div className="p-pd-hero-footer">
                  <div className="p-pd-link-row">
                    {links.map((l, i) => (
                      <a key={i} className="p-pd-link-btn ghost" href={l.href} target="_blank" rel="noreferrer">{l.label || l.href}</a>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Overview */}
        {(longParas.length > 0 || item.description) && (
          <section className="p-section">
            <div className="p-inner">
              <div className="p-pd-overview full-width">
                <div className="p-pd-prose text-left">
                  {longParas.length > 0
                    ? longParas.map((p, i) => <p key={i}>{p}</p>)
                    : item.description && <p>{item.description}</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Metrics */}
        {metrics.length > 0 && (
          <section className="p-section alt">
            <div className="p-inner">
              <div className="p-pd-metrics">
                {metrics.map((m, i) => (
                  <div key={i} className="p-pd-metric">
                    <div className="p-pd-metric-value">{m.value}</div>
                    <div className="p-pd-metric-label">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="p-section">
            <div className="p-inner">
              <h2 className="p-title">Gallery</h2>
              <div className="p-pd-gallery">
                {gallery.map((g, i) => (
                  <figure
                    key={i}
                    onClick={() => {
                      if (g.src) {
                        setSelectedImg(g.src);
                        setCurrentIndex(i);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {g.alt && <div className="p-pd-gallery-label">{g.alt}</div>}
                    {g.src && <img src={g.src} alt={g.alt || ""} style={{ objectPosition: g.focal || "50% 50%" }} />}
                    {g.caption && <figcaption>{g.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Case study */}
        {csEnabled && csSections.length > 0 && (
          <section className="p-section alt">
            <div className="p-inner">
              <h2 className="p-title">Case study</h2>
              {csSections.map((sec: any, i: number) => (
                <div key={i} className={`p-pd-cs-row${i % 2 === 1 ? " flip" : ""}`}>
                  <div>
                    {sec.heading && <h3>{sec.heading}</h3>}
                    {sec.body && <p>{sec.body}</p>}
                  </div>
                  {sec.image
                    ? <img src={sec.image} alt={sec.heading || ""} />
                    : <div />}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        {contactBlock && (
          <section id="contact" className="p-section">
            <div className="p-inner">
              {contactBlock.label && <div className="p-label">{contactBlock.label}</div>}
              {contactBlock.title && <h2 className="p-title">{contactBlock.title}</h2>}
              <div className="p-contact-info">
                {contactBlock.intro && <p>{contactBlock.intro}</p>}
                <div className="p-contact-grid">
                  {(contactBlock.links ?? []).map((l: any, i: number) => (
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
        )}

        {/* Lightbox Modal */}
        {selectedImg && (
          <div className="p-pd-lightbox" onClick={() => setSelectedImg(null)}>
            <button className="p-pd-lightbox-close" onClick={() => setSelectedImg(null)}>
              <X className="w-8 h-8" />
            </button>
            
            {gallery.length > 1 && (
              <>
                <button className="p-pd-lightbox-nav prev" onClick={handlePrev}>
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button className="p-pd-lightbox-nav next" onClick={handleNext}>
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}

            <div className="p-pd-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImg} alt="Gallery Preview" />
            </div>
          </div>
        )}
      </SiteChrome>
    </>
  );
}

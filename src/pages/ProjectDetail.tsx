import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSections, useSiteSettings } from "@/hooks/useSite";
import { useLang } from "@/contexts/LanguageContext";
import { mergeI18n, ui } from "@/lib/i18n";
import SiteChrome, { type PageNavItem } from "@/components/site/SiteChrome";
import { findContactSection, findProjectBySlug, RESERVED_SLUGS, slugify } from "@/lib/projectSlug";
import { buildProjectHead, localizedPath } from "@/lib/seo";
import SeoHead from "@/components/site/SeoHead";
import ContactLinks from "@/components/site/ContactLinks";
import Exploded3D from "@/components/site/Exploded3D";
import SkillPill from "@/components/site/SkillPill";
import { formatRichText } from "@/lib/markdown";
import NotFound from "./NotFound";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProjectDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: sections, isLoading } = useSections(false);
  const { data: settings } = useSiteSettings();
  const { lang } = useLang();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  // Image aspect ratios (width / height) learnt on load, for the justified gallery rows.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const navRef = useRef<{ next: () => void; prev: () => void }>({ next: () => {}, prev: () => {} });

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

  useEffect(() => {
    if (!selectedImg) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImg(null);
      if (e.key === "ArrowRight") navRef.current.next();
      if (e.key === "ArrowLeft") navRef.current.prev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImg]);

  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return <NotFound />;
  }

  if (isLoading) {
    return <div style={{ minHeight: "100vh", background: settings?.theme?.bg || "#f5f3ef" }} aria-hidden />;
  }

  const match = findProjectBySlug(sections, slug);
  
  if (!match) return <NotFound />;

  let item: any;
  let gallery: any[] = [];
  
  try {
    // Translate the single project item via the parent block's i18n.
    const blockTranslated = mergeI18n(match.blockData ?? {}, lang);
    const items: any[] = blockTranslated.items ?? [];
    const rawItems: any[] = match.blockData?.items ?? [];
    const idx = rawItems.indexOf(match.item);
    item = (idx >= 0 ? items[idx] : match.item) ?? match.item;
    gallery = item.gallery ?? [];
  } catch (err) {
    console.error("Error resolving project item:", err);
    return <NotFound />;
  }

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

  navRef.current = { next: () => handleNext(), prev: () => handlePrev() };

  const useOverride = item.contactOverride?.enabled;
  const contactRaw = useOverride ? item.contactOverride : findContactSection(sections);
  const contactBlock = contactRaw ? mergeI18n({ ...contactRaw }, lang) : null;

  const longParas = String(item.longDescription || "")
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const tech: string[] = item.tech ?? [];
  const enTech: string[] = match.item?.tech ?? [];
  const documents: { label?: string; description?: string; file?: string; thumb?: string; meta?: string }[] =
    (item.documents ?? []).filter((d: any) => d?.file);
  const links: { label: string; href: string }[] = (item.links ?? []).filter((l: any) => l?.href);
  const metrics: { label: string; value: string }[] = item.metrics ?? [];
  const csEnabled = item.caseStudy?.enabled;
  const csSections: any[] = item.caseStudy?.sections ?? [];
  const descriptionBlocks: any[] = item.descriptionBlocks ?? [];
  const hasOverview = longParas.length > 0 || !!item.description || descriptionBlocks.length > 0;
  const has3d = !!(item.model3dEnabled && item.model3dUrl);

  // Shortcuts to the sections on this page, shown in the nav (plus About / Projects from the home page).
  const pageNav: PageNavItem[] = [
    hasOverview && { id: "overview", label: ui("navOverview", lang) },
    has3d && { id: "model-3d", label: ui("nav3d", lang) },
    gallery.length > 0 && { id: "gallery", label: ui("gallery", lang) },
    documents.length > 0 && { id: "documents", label: ui("documents", lang) },
    csEnabled && csSections.length > 0 && { id: "case-study", label: ui("caseStudy", lang) },
    contactBlock && { id: "contact", label: ui("navContact", lang) },
  ].filter(Boolean) as PageNavItem[];

  return (
    <>
      <SeoHead head={buildProjectHead(lang, slugify(slug), item, settings)} />
      <SiteChrome pageNav={pageNav}>
        {/* Hero */}
        <section className="p-pd-hero">
          <div className="p-inner" style={{ width: "100%" }}>
            <Link to={localizedPath("/#projects", lang)} className="p-pd-back">{ui("backToHome", lang)}</Link>
            <div className="p-pd-head">
              {item.iconUrl && <img className="p-pd-icon" src={item.iconUrl} alt="" />}
              <h1 className="p-pd-title">{item.title}</h1>
              {(() => {
                const status: string = item.status ?? (item.link ? "live" : "");
                if (status === "live" && item.link) {
                  return (
                    <a className="p-pd-link-btn p-pd-live p-pd-head-btn" href={item.link} target="_blank" rel="noreferrer">
                      <span className="p-pd-live-dot" aria-hidden="true" />
                      <span>{item.liveText || ui("live", lang)}</span>
                    </a>
                  );
                }
                if (status === "in_progress") {
                  return (
                    <span className="p-pd-status p-pd-head-btn"><span aria-hidden="true">🚧</span><span>{ui("inProgress", lang)}</span></span>
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
            {item.subtitle && <p className="p-pd-sub">{formatRichText(item.subtitle)}</p>}
            {(item.role || item.client) && (
              <div className="p-pd-meta">
                {item.role && <span>{formatRichText(item.role)}</span>}
                {item.client && <span>{formatRichText(item.client)}</span>}
              </div>
            )}
            {tech.length > 0 && (
              <div className="p-pd-hero-tech">
                {tech.map((t, i) => <SkillPill key={i} name={t} iconName={enTech[i]} />)}
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

        {/* Overview / Rich Description */}
        {hasOverview && (
          <section id="overview" className="p-section">
            <div className="p-inner">
              <div className="p-pd-overview full-width">
                <div className="p-pd-prose text-left">
                  {/* Legacy simple description */}
                  {longParas.length > 0
                    ? longParas.map((p, i) => <p key={i}>{formatRichText(p)}</p>)
                    : item.description && <p>{formatRichText(item.description)}</p>}
                  
                  {/* Rich blocks */}
                  {descriptionBlocks.map((block, i) => {
                    const img = gallery[block.galleryIndex];
                    const layout = block.layout || "under";
                    const scale = block.scale ?? 100;
                    const fit = block.objectFit || "contain";
                    
                    const isSide = layout.startsWith("side");
                    const imgWrapperStyle: React.CSSProperties = {
                      width: isSide ? "fit-content" : `${scale}%`,
                      maxWidth: isSide ? `${scale}%` : "100%",
                      flex: isSide ? "0 1 auto" : undefined,
                    };
                    const imgStyle: React.CSSProperties = {
                      objectFit: fit as any,
                      objectPosition: img?.focal || "50% 50%",
                    };

                    return (
                      <div key={i} className={`p-pd-desc-block ${layout}`}>
                        <div className="p-pd-desc-text">
                          {(block.text || "").split(/\n\n+/).map((p: string, pi: number) => (
                            <p key={pi}>{p}</p>
                          ))}
                        </div>
                        {img && (
                          <div 
                            className="p-pd-desc-img" 
                            style={imgWrapperStyle}
                            onClick={() => {
                              setSelectedImg(img.src);
                              setCurrentIndex(block.galleryIndex);
                            }}
                          >
                            <img loading="lazy" decoding="async" src={img.src} alt={img.alt || ""} style={imgStyle} />
                            {img.caption && <span className="p-pd-desc-caption">{img.caption}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3D exploded view (optional, scroll-driven) */}
        {has3d && (
          <Exploded3D
            id="model-3d"
            manifestUrl={item.model3dUrl}
            lang={lang}
            eyebrow={item.model3dTitle || ""}
            intro={item.model3dIntro || ""}
          />
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
          <section id="gallery" className="p-section">
            <div className="p-inner">
              <h2 className="p-title">{ui("gallery", lang)}</h2>
              {/* Justified rows: every image keeps its own shape (no cropping, no empty space),
                  images in a row share one height, titles sit below in a fixed two-line slot. */}
              <div className="p-pd-gallery">
                {gallery.map((g, i) => {
                  const ar = g.w > 0 && g.h > 0 ? g.w / g.h : ratios[g.src] ?? 4 / 3;
                  return (
                    <figure
                      key={i}
                      style={{ flexGrow: ar, flexBasis: `calc(${ar.toFixed(4)} * var(--g-row))` }}
                      onClick={() => {
                        if (g.src) {
                          setSelectedImg(g.src);
                          setCurrentIndex(i);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <div className="p-pd-gallery-media" style={{ aspectRatio: ar.toFixed(4) }}>
                        {g.src && (
                          <img
                            loading="lazy"
                            decoding="async"
                            src={g.src}
                            alt={g.alt || ""}
                            onLoad={(e) => {
                              const im = e.currentTarget;
                              if (!im.naturalWidth || !im.naturalHeight || (g.w > 0 && g.h > 0)) return;
                              const r = im.naturalWidth / im.naturalHeight;
                              setRatios((cur) => (Math.abs((cur[g.src] ?? 0) - r) < 0.001 ? cur : { ...cur, [g.src]: r }));
                            }}
                          />
                        )}
                      </div>
                      {(g.alt || g.caption) && (
                        <figcaption>
                          {g.alt && <span className="p-pd-gallery-title">{g.alt}</span>}
                          {g.caption && <span className="p-pd-gallery-caption">{g.caption}</span>}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Documents (PDFs etc.) */}
        {documents.length > 0 && (
          <section id="documents" className="p-section">
            <div className="p-inner">
              <h2 className="p-title">{ui("documents", lang)}</h2>
              <div className="p-pd-docs">
                {documents.map((d, i) => {
                  const name = d.label || decodeURIComponent(String(d.file).split("/").pop() || "");
                  const ext = (String(d.file).split("?")[0].split(".").pop() || "").toUpperCase().slice(0, 4);
                  return (
                    <article key={i} className="p-pd-doc">
                      <a className="p-pd-doc-thumb" href={d.file} target="_blank" rel="noreferrer" aria-label={name}>
                        {d.thumb ? <img loading="lazy" decoding="async" src={d.thumb} alt="" /> : <span>{ext || "FILE"}</span>}
                      </a>
                      <div className="p-pd-doc-body">
                        <span className="p-pd-doc-meta">{d.meta || ext}</span>
                        <h3>{name}</h3>
                        {d.description && <p>{d.description}</p>}
                        <div className="p-pd-doc-actions">
                          <a className="primary" href={d.file} target="_blank" rel="noreferrer">{ui("openFile", lang)}</a>
                          <a href={d.file} download>{ui("downloadFile", lang)}</a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Case study */}
        {csEnabled && csSections.length > 0 && (
          <section id="case-study" className="p-section alt">
            <div className="p-inner">
              <h2 className="p-title">{ui("caseStudy", lang)}</h2>
              {csSections.map((sec: any, i: number) => (
                <div key={i} className={`p-pd-cs-row${i % 2 === 1 ? " flip" : ""}`}>
                  <div>
                    {sec.heading && <h3>{sec.heading}</h3>}
                    {sec.body && <p>{sec.body}</p>}
                  </div>
                  {sec.image
                    ? <img loading="lazy" decoding="async" src={sec.image} alt={sec.heading || ""} />
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
                <ContactLinks links={contactBlock.links ?? []} lang={lang} />
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
              <img src={selectedImg} alt={ui("galleryPreview", lang)} />
            </div>
          </div>
        )}
      </SiteChrome>
    </>
  );
}

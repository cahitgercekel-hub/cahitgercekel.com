import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useSections, useSiteSettings } from "@/hooks/useSite";
import { useLang } from "@/contexts/LanguageContext";
import { mergeI18n } from "@/lib/i18n";
import SiteChrome from "@/components/site/SiteChrome";
import { findContactSection, findProjectBySlug, RESERVED_SLUGS } from "@/lib/projectSlug";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: sections, isLoading } = useSections(false);
  const { data: settings } = useSiteSettings();
  const { lang } = useLang();

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
  const gallery: any[] = item.gallery ?? [];
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
            </div>
            {item.tag && <div className="p-hero-tag">{item.tag}</div>}
            {item.subtitle && <p className="p-pd-sub">{item.subtitle}</p>}
            {(item.role || item.client || item.year) && (
              <div className="p-pd-meta">
                {item.role && <span>{item.role}</span>}
                {item.client && <span>{item.client}</span>}
                {item.year && <span>{item.year}</span>}
              </div>
            )}
            {(links.length > 0 || item.link) && (
              <div className="p-pd-link-row">
                {item.link && (
                  <a className="p-pd-link-btn p-pd-live" href={item.link} target="_blank" rel="noreferrer">
                    <span className="p-pd-live-dot" aria-hidden="true" />
                    <span>Live</span>
                  </a>
                )}
                {links.map((l, i) => (
                  <a key={i} className="p-pd-link-btn ghost" href={l.href} target="_blank" rel="noreferrer">{l.label || l.href}</a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cover image */}
        {item.image && (
          <div className="p-pd-cover">
            <img src={item.image} alt={item.title} style={{ objectPosition: item.focal || "50% 50%" }} />
          </div>
        )}

        {/* Overview */}
        {(longParas.length > 0 || tech.length > 0 || item.description) && (
          <section className="p-section">
            <div className="p-inner">
              <div className="p-pd-overview">
                <div className="p-pd-prose">
                  {longParas.length > 0
                    ? longParas.map((p, i) => <p key={i}>{p}</p>)
                    : item.description && <p>{item.description}</p>}
                </div>
                {tech.length > 0 && (
                  <aside className="p-pd-side">
                    <h4>Tech & Tools</h4>
                    <div className="p-pd-tech">
                      {tech.map((t, i) => <span key={i} className="p-pill">{t}</span>)}
                    </div>
                  </aside>
                )}
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
                  <figure key={i}>
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
      </SiteChrome>
    </>
  );
}


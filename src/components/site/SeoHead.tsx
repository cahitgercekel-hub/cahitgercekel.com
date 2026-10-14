import { Helmet } from "react-helmet-async";
import type { HeadData } from "@/lib/seo";

/** Per-page head tags. Mirrors what vite-plugins/prerender.ts writes into the static HTML. */
export default function SeoHead({ head }: { head: HeadData }) {
  return (
    <Helmet htmlAttributes={{ lang: head.lang }}>
      <title>{head.title}</title>
      <meta name="description" content={head.description} />
      <link rel="canonical" href={head.canonical} />
      {head.alternates.map((a) => (
        <link key={a.hreflang} rel="alternate" hrefLang={a.hreflang} href={a.href} />
      ))}
      <meta property="og:type" content={head.ogType} />
      <meta property="og:title" content={head.title} />
      <meta property="og:description" content={head.description} />
      <meta property="og:url" content={head.canonical} />
      <meta property="og:image" content={head.ogImage} />
      <meta property="og:locale" content={head.ogLocale} />
      <meta property="og:site_name" content="Cahit Emre Gerçekel" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={head.title} />
      <meta name="twitter:description" content={head.description} />
      <meta name="twitter:image" content={head.ogImage} />
      <script type="application/ld+json">{JSON.stringify(head.jsonLd)}</script>
    </Helmet>
  );
}

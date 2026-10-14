import { useState } from "react";
import { ui } from "@/lib/i18n";
import type { Lang } from "@/contexts/LanguageContext";

type ContactLink = { href?: string; label?: string; icon?: string; iconUrl?: string };

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers/contexts without the async clipboard API
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function Icon({ link }: { link: ContactLink }) {
  return link.iconUrl
    ? <img className="p-contact-icon" loading="lazy" decoding="async" src={link.iconUrl} alt="" />
    : <span>{link.icon}</span>;
}

/**
 * Email links show the address with a Copy button instead of opening the
 * visitor's local mail app (mailto:), which many people don't have set up.
 */
function EmailCard({ link, lang }: { link: ContactLink; lang: Lang }) {
  const address = decodeURIComponent((link.href ?? "").replace(/^mailto:/i, "").split("?")[0]);
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (await copyText(address)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button type="button" className="p-contact-link p-contact-email" onClick={onCopy} aria-label={`${ui("copy", lang)}: ${address}`}>
      <Icon link={link} />
      <span className="p-contact-email-addr">{address}</span>
      <span className={`p-contact-copy${copied ? " copied" : ""}`} aria-live="polite">
        {copied ? ui("copied", lang) : ui("copy", lang)}
      </span>
    </button>
  );
}

export default function ContactLinks({ links, lang }: { links: ContactLink[]; lang: Lang }) {
  return (
    <div className="p-contact-grid">
      {links.map((l, i) =>
        /^mailto:/i.test(l.href ?? "") ? (
          <EmailCard key={i} link={l} lang={lang} />
        ) : (
          <a key={i} className="p-contact-link" href={l.href} target="_blank" rel="noreferrer">
            <Icon link={l} />
            <span>{l.label}</span>
          </a>
        ),
      )}
    </div>
  );
}

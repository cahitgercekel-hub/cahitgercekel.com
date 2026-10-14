import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { langFromPath, localizedPath, stripLang } from "@/lib/seo";

export type Lang = "en" | "tr" | "de";
export const LANGS: Lang[] = ["en", "tr", "de"];

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {} });

/**
 * The language comes from the URL prefix ("/", "/tr/...", "/de/...") so every
 * language version has its own crawlable address. Must be rendered inside the router.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = langFromPath(location.pathname);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => navigate(localizedPath(stripLang(location.pathname), l) + location.hash);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

// Block type definitions and defaults for the page builder

export type BlockType =
  | "hero"
  | "about"
  | "stats"
  | "projects"
  | "experience"
  | "contact"
  | "image"
  | "html"
  | "footer";

export interface SectionRow {
  id: string;
  type: BlockType;
  position: number;
  visible: boolean;
  data: any;
}

export interface SiteSettings {
  id: string;
  logo_text: string;
  theme: {
    accent: string;
    accent2: string;
    accent3: string;
    bg: string;
    fg: string;
    heroGradient: string;
  };
  nav_items: { label: string; href: string }[];
  footer_text: string;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  about: "About / Text",
  stats: "Stat bars",
  projects: "Project grid",
  experience: "Timeline / Experience",
  contact: "Contact links",
  image: "Image",
  html: "Custom HTML",
  footer: "Footer note",
};

export const BLOCK_DEFAULTS: Record<BlockType, any> = {
  hero: {
    id: "hero",
    tag: "Open to opportunities",
    name: "Your Name",
    subtitle: "Product Manager & Maker",
    primaryBtn: { label: "View Projects", href: "#projects" },
    secondaryBtn: { label: "Contact Me", href: "#contact" },
  },
  about: {
    id: "about",
    label: "Who I am",
    title: "About Me",
    paragraphs: ["First paragraph...", "Second paragraph..."],
    skills: ["Skill 1", "Skill 2"],
  },
  stats: {
    id: "stats",
    label: "Skills",
    title: "What I do",
    items: [{ label: "Skill", value: 80 }],
  },
  projects: {
    id: "projects",
    label: "What I've built",
    title: "Selected Projects",
    items: [
      { tag: "Web", title: "Project", description: "Description.", image: "", link: "#", emoji: "🚀" },
    ],
  },
  experience: {
    id: "experience",
    label: "Career",
    title: "Work Experience",
    items: [{ period: "2024", role: "Role", company: "Company", description: "Description." }],
  },
  contact: {
    id: "contact",
    label: "Get in touch",
    title: "Let's Connect",
    intro: "Drop me a line.",
    links: [{ icon: "✉️", label: "email@example.com", href: "mailto:email@example.com" }],
  },
  image: {
    id: "image",
    src: "",
    alt: "",
    caption: "",
    align: "center",
    maxWidth: 720,
  },
  html: {
    id: "html",
    html: "<p>Custom HTML here</p>",
  },
  footer: {
    id: "footer",
    text: "© 2025 Your Name. Crafted with ❤️",
  },
};

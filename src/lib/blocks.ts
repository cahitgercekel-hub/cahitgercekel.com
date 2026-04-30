// Block type definitions and defaults for the page builder

export type BlockType =
  | "hero"
  | "about"
  | "stats"
  | "skills"
  | "languages"
  | "projects"
  | "experience"
  | "contact"
  | "logos"
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
  font_family?: string;
  radius?: number;
  site_title?: string;
  meta_description?: string;
  favicon_url?: string;
  og_image_url?: string;
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero",
  about: "About / Text",
  stats: "Skill bars",
  skills: "Skill pills",
  languages: "Languages",
  projects: "Project grid",
  experience: "Timeline / Experience",
  contact: "Contact links",
  logos: "Logos / Previously at",
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
    image: "",
    cvUrl: "",
    cvLabel: "Download CV",
    primaryBtn: { label: "View Projects", href: "#projects" },
    secondaryBtn: { label: "Contact Me", href: "#contact" },
  },
  about: {
    id: "about",
    label: "Who I am",
    title: "About Me",
    paragraphs: ["First paragraph...", "Second paragraph..."],
    skills: ["Skill 1", "Skill 2"],
    portrait: "",
  },
  stats: {
    id: "stats",
    label: "Skills",
    title: "What I do",
    items: [{ label: "Skill", value: 80 }],
  },
  skills: {
    id: "skills",
    label: "Toolbox",
    title: "Skills",
    groups: [
      { name: "Design", items: ["Figma", "Sketch"] },
      { name: "Product", items: ["Roadmapping", "Discovery"] },
    ],
  },
  languages: {
    id: "languages",
    label: "Languages",
    title: "Languages I speak",
    items: [
      { name: "English", level: "Fluent", value: 90 },
    ],
  },
  projects: {
    id: "projects",
    label: "What I've built",
    title: "Selected Projects",
    items: [
      { tag: "Web", title: "Project", description: "Description.", image: "", link: "#", emoji: "🚀", featured: false },
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
    links: [{ icon: "✉️", iconUrl: "", label: "email@example.com", href: "mailto:email@example.com" }],
  },
  logos: {
    id: "logos",
    label: "Previously at",
    title: "",
    items: [
      { name: "Company", logo: "", href: "" },
    ],
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

/* design.md §3.5 / §3.9 — the navigation model.
 *
 * §3.5: "ONLY 5 NAV ITEMS. Research shows decision paralysis in this category;
 * 9 services collapse into a single 'Services' panel." §0.2 rejects the
 * "cluttered mega-menu of 30 services" outright.
 *
 * §3.9: the nine services group by INTENT, not by trade name, "because visitors
 * arrive with an intent, not a service name" — "I have a plot", "I have a house
 * that needs work", "I want it to look beautiful".
 */

export type NavItem = { label: string; href: string };

/* §10.3 lexicon governs these labels. `Explore`, `Learn more` and `Click here`
 * are banned; nav CTAs are `See our work` and `Read the process`. */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
];

export type ServiceGroup = {
  key: "build" | "transform" | "finish";
  /** §3.9 — the visitor's own words, shown above the group. */
  intent: string;
  label: string;
  services: (NavItem & { description: string })[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    key: "build",
    intent: "I have a plot",
    label: "Build",
    services: [
      {
        label: "House Construction",
        href: "/services/house-construction",
        description: "Plot to handover, one accountable party",
      },
      {
        label: "Turnkey Home Solutions",
        href: "/services/turnkey-home-solutions",
        description: "Construction and interiors on one contract",
      },
    ],
  },
  {
    key: "transform",
    intent: "I have a house that needs work",
    label: "Transform",
    services: [
      {
        label: "Home Renovation",
        href: "/services/home-renovation",
        description: "Phased, so you can keep living in it",
      },
      {
        label: "Waterproofing",
        href: "/services/waterproofing",
        description: "Photographed before it is tiled over",
      },
      {
        label: "Painting",
        href: "/services/painting",
        description: "Surface preparation you can inspect",
      },
      {
        label: "Electrical Work",
        href: "/services/electrical-work",
        description: "Every conduit run photographed",
      },
    ],
  },
  {
    key: "finish",
    intent: "I want it to look beautiful",
    label: "Finish",
    services: [
      {
        label: "Interior Design",
        href: "/services/interior-design",
        description: "Detailed before a sheet is cut",
      },
      {
        label: "Modular Kitchen",
        href: "/services/modular-kitchen",
        description: "Hardware quoted by brand and grade",
      },
      {
        label: "False Ceiling",
        href: "/services/false-ceiling",
        description: "Access panels where the services are",
      },
    ],
  },
];

/* §3.5 — "The 'Explore' column SOLVES AN IA GAP: /materials, /gallery and
 * /process are high-value pages that a 5-item nav cannot hold and that A FOOTER
 * LINK WILL NOT SURFACE. They live here, in the panel's fourth column, with
 * one-line descriptors."
 *
 * Note the panel's own heading is "Explore" but no LINK uses that word — §10.3
 * bans it as CTA text. It is a column label, not an action. */
export const EXPLORE_LINKS: (NavItem & { description: string })[] = [
  {
    label: "Materials library",
    href: "/materials",
    description: "Every material, with its brand and grade",
  },
  {
    label: "Gallery",
    href: "/gallery",
    description: "Every room we have finished, by room type",
  },
  {
    label: "How a build runs",
    href: "/process",
    description: "38 steps and 9 payment milestones",
  },
  {
    label: "Cost guides",
    href: "/journal/category/cost-guides",
    description: "What things actually cost in Bhopal, 2026",
  },
];

/* §3.8 zone 2 — the footer link matrix. Services carry a one-line descriptor;
 * §10.5 makes the footer a real internal-linking surface. */
export const FOOTER_COLUMNS = [
  {
    title: "Services",
    links: SERVICE_GROUPS.flatMap((group) =>
      group.services.map((service) => ({
        label: service.label,
        href: service.href,
        description: service.description,
      })),
    ),
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Process", href: "/process" },
      { label: "Careers", href: "/careers" },
      { label: "Reviews", href: "/reviews" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Materials", href: "/materials" },
      { label: "Downloads", href: "/downloads" },
      { label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
];

/* FR-GBL-05 — "All WhatsApp links are PRE-FILLED WITH PAGE CONTEXT (page title,
 * and project name where applicable)."
 *
 * §3.6 explains why this matters commercially: "the message is pre-filled with
 * the page context — 'Hi, I'm looking at your Villa at Prabhat Road project.'
 * This gives the sales team INSTANT CONTEXT and dramatically raises reply
 * quality." */
export function whatsappLink(phoneE164: string, context?: string): string {
  const number = phoneE164.replace(/[^\d]/g, "");
  const message = context
    ? `Hi, I'm looking at your ${context}.`
    : "Hi, I'd like to talk about a project.";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

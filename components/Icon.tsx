type IconName =
  | "search"
  | "user"
  | "bag"
  | "menu"
  | "close"
  | "arrow"
  | "instagram"
  | "facebook"
  | "pinterest";

export default function Icon({ name }: { name: IconName }) {
  const shared = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.2 4.2" /></>,
    user: <><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20c.6-3.5 2.8-5.4 6.5-5.4s5.9 1.9 6.5 5.4" /></>,
    bag: <><path d="M5 8.5h14l1 12H4l1-12Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>,
    instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="3.7" /><path d="M17.6 6.5h.01" /></>,
    facebook: <path d="M14 8h3V4h-3a5 5 0 0 0-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9a1 1 0 0 1 1-1Z" />,
    pinterest: <><path d="M12 21a9 9 0 1 0-3.2-.6" /><path d="M9 19.5c1.1-1.4 1.6-4.4 2.1-6.9m2.8-3.7c-2.2 0-3.4 1.7-3.4 3.4 0 1.1.4 2.1 1.2 2.1 1.2 0 2.1-2.9 2.1-4.4 0-1.3-.8-2.1-2-2.1" /></>,
  };

  return <svg {...shared}>{paths[name]}</svg>;
}

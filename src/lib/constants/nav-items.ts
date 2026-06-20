export const APP_NAV_ITEMS = [
  { href: "/discover", label: "Discover", icon: "compass" as const },
  { href: "/compatibility", label: "Compatibility", icon: "heart-handshake" as const },
  { href: "/chats", label: "Chats", icon: "message-circle" as const },
  { href: "/activity", label: "Activity", icon: "bell" as const },
  { href: "/profile", label: "Profile", icon: "user" as const },
] as const;

export type AppNavIcon = (typeof APP_NAV_ITEMS)[number]["icon"];

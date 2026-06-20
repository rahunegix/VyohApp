export type AuthVisualImage = {
  src: string;
  alt: string;
  label: string;
};

/** Curated Unsplash images — Hindu wedding & Indian relationship themes */
export const AUTH_VISUAL_IMAGES: AuthVisualImage[] = [
  {
    src: "https://images.unsplash.com/photo-1583934270204-75a0e3b05ec5?auto=format&fit=crop&w=900&q=80",
    alt: "Hindu wedding ceremony with sacred fire and rituals",
    label: "Sacred rituals",
  },
  {
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    alt: "Indian bride adorned with traditional jewelry and marigolds",
    label: "Wedding traditions",
  },
  {
    src: "https://images.unsplash.com/photo-1594938298608-81462b183b6d?auto=format&fit=crop&w=900&q=80",
    alt: "Mehndi ceremony with intricate henna designs",
    label: "Mehndi & celebrations",
  },
  {
    src: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80",
    alt: "Indian wedding couple in traditional attire",
    label: "Lifelong commitment",
  },
  {
    src: "https://images.unsplash.com/photo-1522673607200-8d87521a1536?auto=format&fit=crop&w=900&q=80",
    alt: "Indian couple celebrating together at a wedding",
    label: "Modern connections",
  },
  {
    src: "https://images.unsplash.com/photo-1537633553432-9aae062da558?auto=format&fit=crop&w=900&q=80",
    alt: "Couple sharing a joyful moment at an Indian wedding",
    label: "Shared joy",
  },
];

export function getAuthVisualImages(variant: "welcome" | "login" | "onboarding") {
  if (variant === "login") {
    return [AUTH_VISUAL_IMAGES[0], AUTH_VISUAL_IMAGES[2], AUTH_VISUAL_IMAGES[3], AUTH_VISUAL_IMAGES[5]];
  }
  if (variant === "onboarding") {
    return [AUTH_VISUAL_IMAGES[4], AUTH_VISUAL_IMAGES[1], AUTH_VISUAL_IMAGES[2], AUTH_VISUAL_IMAGES[3]];
  }
  return AUTH_VISUAL_IMAGES;
}

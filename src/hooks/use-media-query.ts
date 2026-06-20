export function useMediaQuery(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 480px)");
}

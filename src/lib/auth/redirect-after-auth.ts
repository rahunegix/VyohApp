/** Full page navigation so HttpOnly auth cookies are sent on the next request. */
export function redirectAfterAuth(path: string) {
  if (typeof window === "undefined") return;
  window.location.assign(path);
}

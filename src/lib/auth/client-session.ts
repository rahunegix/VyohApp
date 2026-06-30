/** Fetch /api/auth/me with silent cookie refresh when the access token expired. */
export async function fetchAuthMe() {
  let res = await fetch("/api/auth/me", { credentials: "same-origin" });
  if (res.status === 401) {
    const refreshed = await fetch("/api/auth/session", {
      method: "POST",
      credentials: "same-origin",
    });
    if (refreshed.ok) {
      res = await fetch("/api/auth/me", { credentials: "same-origin" });
    }
  }
  return res;
}

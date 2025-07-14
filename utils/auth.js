export function getUserFromToken() {
  const t = typeof window !== "undefined" && localStorage.getItem("token");
  if (!t) return null;
  try {
    return JSON.parse(atob(t.split(".")[1])).user;
  } catch {
    return null;
  }
}

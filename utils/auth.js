export function getUserFromToken() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload.user; // Contains { id, role }
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

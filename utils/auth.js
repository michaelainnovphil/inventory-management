export function getUserFromToken() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(base64Url));
    return decodedPayload.user; // ⬅️ includes id and role
  } catch (error) {
    console.error("Token decode failed:", error);
    return null;
  }
}

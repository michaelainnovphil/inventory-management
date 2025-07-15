import jwt_decode from "jwt-decode";

export function getUserFromToken() {
  try {
    const raw = localStorage.getItem("token");
    if (!raw) return null;

    const token = raw.replace(/^Bearer\s+/, ""); // clean "Bearer " prefix
    const decoded = jwt_decode(token);

    console.log("✅ Decoded token:", decoded);

    return decoded?.user ? decoded.user : null;
  } catch (err) {
    console.error("❌ Failed to decode token:", err);
    return null;
  }
}

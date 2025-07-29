import { jwtDecode } from "jwt-decode";

export function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode(token);
    console.log("🧩 Decoded Token:", decoded); // 👈 log full token content
    return decoded;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

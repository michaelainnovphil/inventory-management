import jwt_decode from "jwt-decode";

export function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwt_decode(token); // contains { sub, role, iat, exp }

    return {
      id: decoded.sub,
      role: decoded.role,
    };
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

import jwt_decode from "jwt-decode";

export function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwt_decode(token);
    return decoded;
  } catch (err) {
    return null;
  }
}

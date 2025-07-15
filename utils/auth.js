import jwt_decode from "jwt-decode";

export function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwt_decode(token);

    // Check if decoded contains a nested `user` object with `role`
    if (decoded && decoded.user && decoded.user.role) {
      return decoded.user; // this returns: { id, role }
    }

    return null;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}

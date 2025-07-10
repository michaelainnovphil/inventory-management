import { Suspense } from "react";
import Login from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <Login />
    </Suspense>
  );
}

import { Suspense } from "react";
import Login from "./LoginClient"; // your component above, rename file if needed

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}

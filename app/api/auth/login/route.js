import { Suspense } from "react";
import LoginClient from "@/app/(auth)/login/LoginClient";


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}

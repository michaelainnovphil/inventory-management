"use client";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {error && <p className="text-red-500 mb-2">Login failed: {error}</p>}
      {/* Your login form goes here */}
    </div>
  );
}

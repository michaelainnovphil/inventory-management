"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@/components/Alert";

Alert;
const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [alert, setAlert] = useState(null);
  const [inputType, setInputType] = useState("password");

  const changeInputType = () => {
    setInputType(inputType === "password" ? "text" : "password");
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const showAlert = (message, type) => {
    setAlert({ msg: message, type });
    setTimeout(() => setAlert(null), 2500);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const res = await response.json();

      if (res.success) {
        localStorage.setItem("token", res.authtoken);
        showAlert("Logged In Successfully!", "success");
        setCredentials({ email: "", password: "" });
        router.replace(callbackUrl);
      } else {
        showAlert(res.error || "Something went wrong!", "danger");
      }
    } catch (error) {
      showAlert(error?.message || "Something went wrong!", "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Alert alert={alert} showAlert={showAlert} />
      <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg overflow-hidden grid md:grid-cols-2">
        <div className="hidden md:block">
          <img src="/st-bg.png" alt="Login" className="h-full w-full object-cover" />
        </div>

        <div className="p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>

          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={onChange}
                className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
              <input
                type={inputType}
                id="password"
                name="password"
                value={credentials.password}
                onChange={onChange}
                className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="showPassword"
                onChange={changeInputType}
                className="mr-2"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-600">
                Show Password
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-[#2ff9c6] hover:text-black transition-colors text-white py-2.5 rounded font-medium shadow-md"
            >
              Sign In
            </button>

            <p className="mt-6 text-sm text-center">
              Don't have an account?{" "}
              <Link href="/signup" className="text-green-500 hover:underline">
                Register Now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;

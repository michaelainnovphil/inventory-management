"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Alert from "@/components/Alert";

const Signup = () => {
  const [alert, setAlert] = useState(null);
  const [inputType, setInputType] = useState("password");
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 2500);
  };

  const onChange = (e) =>
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.authtoken);
        showAlert("Account created successfully!", "success");
        setCredentials({ name: "", email: "", password: "" });
        router.replace("/dashboard");
      } else {
        showAlert(data.error || "Signup failed!", "danger");
      }
    } catch (err) {
      showAlert(err.message || "Something went wrong!", "danger");
    }
  };

  const togglePassword = () =>
    setInputType(prev => (prev === "password" ? "text" : "password"));

  return (
    <section className="h-screen">
      <Alert alert={alert} showAlert={showAlert} />
      <div className="h-full mt-8 p-8 rounded-md">
        <div className="g-6 flex h-full flex-wrap mx-auto items-center w-2/3 justify-center lg:justify-between">
          <div className="shrink-1 mb-12 grow-0 basis-auto md:w-6/12">
            <img src="/signup-bg.jpg" alt="Signup" className="w-full rounded-lg" />
          </div>
          <div className="md:w-5/12">
            <form onSubmit={submitHandler} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-1 font-medium">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={credentials.name}
                  onChange={onChange}
                  placeholder="Your name"
                  className="w-full rounded bg-white px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={credentials.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  className="w-full rounded bg-white px-3 py-2 outline-none"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1 font-medium">Password</label>
                <input
                  id="password"
                  name="password"
                  type={inputType}
                  required
                  minLength={5}
                  value={credentials.password}
                  onChange={onChange}
                  placeholder="Create a password"
                  className="w-full rounded bg-white px-3 py-2 outline-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="showPass"
                  type="checkbox"
                  checked={inputType === "text"}
                  onChange={togglePassword}
                  className="mr-2"
                />
                <label htmlFor="showPass">Show Password</label>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white px-7 py-3 rounded shadow hover:bg-[#2ff9c6] hover:text-black transition-colors"
                >
                  Sign Up
                </button>
              </div>
              <p className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login">
                  <span className="text-blue-600 hover:underline">Login here</span>
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;

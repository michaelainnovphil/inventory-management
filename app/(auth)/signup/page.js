"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Signup = () => {
  const [inputType, setInputType] = useState("password");
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const changeInputType = () => {
    setInputType(prev => (prev === "password" ? "text" : "password"));
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const { name, email, password } = credentials;

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const res = await response.json();

      if (res?.success) {
        localStorage.setItem("token", res.authtoken);
        setCredentials({ name: "", email: "", password: "" });
        setShowSuccessModal(true); // Show modal
      } else {
        alert(res.error ? res.error : "Something went wrong!");
        setCredentials({ name: "", email: "", password: "" });
      }
    } catch (error) {
      alert(error?.message || "Something went wrong!");
    }
  };

  return (
    <section className="h-screen flex items-center justify-center bg-gray-100">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-2 text-green-600">Success!</h2>
            <p className="text-gray-700 mb-4">Your account has been created successfully.</p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/login");
              }}
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto flex flex-col lg:flex-row bg-white shadow-md rounded-xl overflow-hidden w-full max-w-5xl">
        {/* Left side image */}
        <div className="lg:w-1/2 hidden lg:block">
          <img
            src="/signup-bg.jpg"
            alt="Signup Visual"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right side form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Create an Account</h2>
          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={credentials.name}
                onChange={onChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={onChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={inputType}
                id="password"
                name="password"
                minLength={5}
                value={credentials.password}
                onChange={onChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="mt-2 text-sm">
                <input type="checkbox" onChange={changeInputType} /> Show Password
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white py-2 px-4 rounded shadow"
            >
              Sign Up
            </button>

            <p className="text-sm text-center mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Signup;

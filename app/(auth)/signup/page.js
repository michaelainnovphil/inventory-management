"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Alert from "@/components/Alert";
import ButtonPrimary from "../../../components/ButtonPrimary";

const Signup = () => {
  const [alert, setAlert] = useState(null);
  const [inputType, setInputType] = useState("password")

  const changeInputType = () => {
    if (inputType == "password") {
      setInputType("text")
    } else if (inputType == "text") {
      setInputType("password")
    }
  }
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type,
    });
    setTimeout(() => {
      setAlert(null);
    }, 2500);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const res = await response.json();

      if (res?.success) {
        showAlert("Account Created Successful!", "success");
        localStorage.setItem("token", res.authtoken);

        setCredentials({ name: "", email: "", password: "" });
        //router.push("/");
        return;
      } else {
        showAlert(res.error ? res.error : "Something went wrong!", "danger");
        setCredentials({ name: "", email: "", password: "" });
        // router.push("/login");
        return;
      }
    } catch (error) {
      showAlert(
        error instanceof Object && error.message
          ? error.message
          : error
            ? error
            : "Something went wrong!",
        "danger"
      );
    }
  };

  return (
    <section className="h-screen flex items-center justify-center bg-gray-100">
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

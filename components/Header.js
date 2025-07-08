"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Header = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [name, setName] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setName("");
    router.replace("/");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      let rjson = await response.json();
      if (rjson.success) {
        setName(rjson.user.name);
        setToken(rjson.token);
      } else {
        setName("");
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="bg-white shadow-md rounded-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and User */}
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-17 h-14 rounded" />
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-gray-800">
            
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {token && (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Dashboard
              </Link>
              <Link
                href="/inventory"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Inventory
              </Link>
            </>
          )}

          {token ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-md font-semibold shadow"
            >
              Logout
            </button>
          ) : (
            <Link href="/signup">
              <span className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-md font-semibold shadow cursor-pointer">
                Signup
              </span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

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
    <header className="bg-gradient-to-r from-white to-white text-white shadow-md rounded-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and User */}
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-17 h-14 rounded" />
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-black">
            Welcome, {name || "Guest"}
          </h1>
        </div>

        {/* Nav button */}
        <nav>
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded-md font-semibold shadow"
            >
              Logout
            </button>
          ) : (
            <Link href="/signup">
              <button className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-md font-semibold shadow">
                Signup
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

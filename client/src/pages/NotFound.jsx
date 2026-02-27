import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-xl mb-6">Page haipo au imeondolewa 😢</p>
      <Link
        to="/"
        className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-500 transition"
      >
        Rudi Home
      </Link>
    </div>
  );
}
